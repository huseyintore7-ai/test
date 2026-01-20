import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const ANALYSIS_SYSTEM_PROMPT = `
Sen viral video uzmanısın. Sana bir YouTube video bağlantısı verilecek.
Görevin, Google Search aracını kullanarak bu videoyu, yorumlarını ve içeriğini analiz etmek ve viral olma potansiyeli en yüksek anları belirlemektir.

Aşağıdaki adımları izle:
1. Videonun konusunu ve genel akışını anla.
2. Yorumlarda sıkça bahsedilen zaman damgalarını (timestamps) ara.
3. İnsanların "en komik an", "efsane kısım", "korktum" gibi tepkiler verdiği anları belirle.
4. Her kesit için tıklanabilirliği artıracak "Viral Başlık" ve açıklama yaz.
5. Google Search kullanarak videonun en çok etkileşim alan kısımlarını doğrula.

ÖNEMLİ: Yanıtını SADECE aşağıdaki formatta saf bir JSON objesi olarak ver. Markdown formatı (clean text) kullan, kod bloğu içine alma.

{
  "clips": [
    {
      "start": 120,
      "end": 135,
      "title": "Örnek Başlık",
      "description": "Örnek açıklama..."
    }
  ],
  "peakMoment": "Detaylı analiz metni..."
}
`;

export const analyzeVideoWithGemini = async (
  apiKey: string,
  videoId: string,
  videoUrl: string
): Promise<AnalysisResult> => {
  if (!apiKey) throw new Error("API Anahtarı eksik.");

  const ai = new GoogleGenAI({ apiKey });

  // gemini-2.0-flash-exp supports search grounding
  const modelId = "gemini-2.0-flash-exp"; 

  const promptText = `
    Analiz Edilecek YouTube Videosu: ${videoUrl}
    
    Lütfen bu videoyu araştır. Yorumları, açıklamayı ve videonun popüler kısımlarını bul.
    Bana viral olma potansiyeli en yüksek 3 kesiti (start/end saniyeleriyle) JSON formatında ver.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: promptText }
        ]
      },
      config: {
        systemInstruction: ANALYSIS_SYSTEM_PROMPT,
        // responseMimeType and responseSchema REMOVED because they conflict with googleSearch tool
        // Instead, we rely on the system prompt to enforce JSON structure.
        tools: [{googleSearch: {}}], 
      }
    });

    const jsonText = response.text;
    
    // Log grounding metadata if available (for debugging)
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      console.log("Grounding Sources:", response.candidates[0].groundingMetadata.groundingChunks);
    }

    if (!jsonText) throw new Error("Gemini boş yanıt döndürdü.");
    
    // Robust cleaning of markdown code blocks
    let cleanedJson = jsonText.trim();
    // Remove wrapping ```json ... ``` or ``` ... ```
    if (cleanedJson.startsWith("```")) {
       cleanedJson = cleanedJson.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    }

    try {
      const result = JSON.parse(cleanedJson) as AnalysisResult;
      
      // Basic validation
      if(!result.clips || !Array.isArray(result.clips)) {
         throw new Error("JSON yanıtı eksik veya hatalı formatta.");
      }
      
      return result;
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError, "Raw Text:", jsonText);
      throw new Error("AI yanıtı geçerli bir JSON formatında değil. Lütfen tekrar deneyin.");
    }

  } catch (error: any) {
    console.error("Gemini Hatası:", error);
    
    if (error.message?.includes("404") || error.toString().includes("404")) {
       throw new Error(`Model bulunamadı (${modelId}). Lütfen API anahtarınızın bu modele erişimi olduğundan emin olun.`);
    }
    
    if (error.message?.includes("controlled generation")) {
        throw new Error("Google Search aracı ile JSON şeması aynı anda kullanılamaz. Ayarlar güncellendi, lütfen tekrar deneyin.");
    }

    throw new Error(`Analiz başarısız: ${error.message || error}`);
  }
};