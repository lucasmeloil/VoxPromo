import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { GeneratedAdContent, GeminiVoiceName } from '../types';

/**
 * Encodes a Uint8Array to a base64 string.
 * @param bytes The Uint8Array to encode.
 * @returns A base64 encoded string.
 */
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a base64 string to a Uint8Array.
 * @param base64 The base64 string to decode.
 * @returns A Uint8Array.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 * This function is used for AudioContext processing, not directly for HTML audio element src.
 * @param data The Uint8Array containing raw PCM data.
 * @param ctx The AudioContext to use for decoding.
 * @param sampleRate The sample rate of the audio data.
 * @param numChannels The number of audio channels (e.g., 1 for mono).
 * @returns A Promise that resolves with the decoded AudioBuffer.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Writes a string to a DataView at a specific offset.
 * @param view The DataView to write to.
 * @param offset The starting offset.
 * @param str The string to write.
 */
function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Creates a WAV Blob from raw PCM audio data.
 * @param audioData The Uint8Array containing raw PCM data.
 * @param sampleRate The sample rate of the audio.
 * @param numChannels The number of audio channels.
 * @param bitsPerSample The number of bits per sample.
 * @returns A Blob representing the WAV file.
 */
function createWavBlob(audioData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob {
  const dataLength = audioData.byteLength;
  const buffer = new ArrayBuffer(44 + dataLength); // 44 bytes for WAV header
  const view = new DataView(buffer);

  // RIFF chunk
  writeString(view, 0, 'RIFF'); // ChunkID
  view.setUint32(4, 36 + dataLength, true); // ChunkSize (total file size - 8 bytes)
  writeString(view, 8, 'WAVE'); // Format

  // fmt sub-chunk
  writeString(view, 12, 'fmt '); // Subchunk1ID
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data'); // Subchunk2ID
  view.setUint32(40, dataLength, true); // Subchunk2Size

  // Copy audio data
  const dataBytes = new Uint8Array(buffer, 44); // Start copying at offset 44
  dataBytes.set(audioData);

  return new Blob([buffer], { type: 'audio/wav' });
}

const initializeGeminiClient = async () => {
  // Utiliza diretamente a chave API fornecida pelo usuário,
  // pois process.env.API_KEY não está sendo configurado no ambiente do navegador
  // e o usuário solicitou uma configuração "automática" sem UI de seleção.
  const API_KEY = "AIzaSyDgwcVDiFc6v7-m0kwF2EtShRZjj2Pdj-M"; // Chave API fornecida pelo usuário
  if (!API_KEY) {
    throw new Error("A chave API não está configurada. Por favor, certifique-se de que está definida.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};


export const generateAdContent = async (
  prompt: string,
  tone: string,
  mediaType: string,
): Promise<GeneratedAdContent> => {
  try {
    const ai = await initializeGeminiClient(); // Initialize client here

    const systemInstruction = `Você é um especialista em marketing e um criador de conteúdo para propagandas. 
    Sua tarefa é gerar um roteiro de propaganda (adScript) e uma sugestão de trilha sonora (musicSuggestion) para um anúncio.
    O adScript deve ser conciso, criativo e adequado para o tipo de mídia e tom especificados.
    A musicSuggestion deve descrever o estilo musical, instrumentos, ritmo e emoção desejados para acompanhar o adScript.
    Responda apenas com um objeto JSON no formato: { "adScript": "...", "musicSuggestion": "..." }.`;

    const fullPrompt = `Crie uma propaganda com o seguinte tema e características:
    Tema: "${prompt}"
    Tom: "${tone}"
    Mídia-alvo: "${mediaType}"`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adScript: {
              type: Type.STRING,
              description: 'O roteiro narrativo ou cantado da propaganda.',
            },
            musicSuggestion: {
              type: Type.STRING,
              description: 'Uma descrição da trilha sonora ou jingle sugerido para a propaganda.',
            },
          },
          propertyOrdering: ["adScript", "musicSuggestion"],
        },
        maxOutputTokens: 500,
        thinkingConfig: { thinkingBudget: 100 },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as GeneratedAdContent;
  } catch (error: any) {
    console.error("Error generating ad content:", error);
    throw new Error(`Falha ao gerar o conteúdo da propaganda: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateSpeech = async (
  text: string,
  voiceName: GeminiVoiceName,
): Promise<string> => {
  try {
    const ai = await initializeGeminiClient(); // Initialize client here

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64RawPcm = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64RawPcm) {
      throw new Error('No audio data received from Gemini API.');
    }

    // 1. Decode the base64 raw PCM to Uint8Array
    const rawPcmBytes = decode(base64RawPcm);

    // 2. Create a WAV Blob from the raw PCM data
    const sampleRate = 24000; // As per Gemini TTS model output
    const numChannels = 1;    // Mono audio
    const bitsPerSample = 16; // 16-bit PCM (standard for Int16Array samples)
    const wavBlob = createWavBlob(rawPcmBytes, sampleRate, numChannels, bitsPerSample);

    // 3. Convert the WAV Blob back to a base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('Failed to read WAV Blob as data URL.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(wavBlob);
    });

  } catch (error: any) {
    console.error("Error generating speech:", error);
    throw new Error(`Falha ao gerar o áudio da propaganda: ${error instanceof Error ? error.message : String(error)}`);
  }
};