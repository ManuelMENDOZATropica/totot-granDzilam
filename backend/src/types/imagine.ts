export type ImagineImageSize = '1024x1024' | '1024x1536' | '1536x1024';

export interface ImagineResult {
  textoInspirador: string;
  promptVisual: string;
  imageUrl: string | null;
  imageBase64?: string | null;
  imageId?: string | null;
  /** Id de la interacción de Gemini: permite refinar esta misma imagen después. */
  interactionId?: string | null;
}
