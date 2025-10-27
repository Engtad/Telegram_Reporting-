import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface FrameTitleAnalysis {
  projectTitle: string;
  sectionTitles: string[];
  suggestedFrameTitles: string[];
}

export async function generateFrameTitles(
  notes: string[],
  photoCaptions: string[],
  projectName?: string
): Promise<FrameTitleAnalysis> {
  const content = `
User Notes: ${notes.join(', ')}
Photo Captions: ${photoCaptions.join(', ')}
Project Name: ${projectName || 'Field Report'}

Based on this field report content, generate appropriate frame titles for a professional engineering report with ISO 5457 border frames.

Please provide:
1. A main project title for the cover page
2. Section titles for different pages (executive summary, observations, photos, etc.)
3. Frame titles for the header-info boxes in the border frames

Format the response as a JSON object with:
- projectTitle: string
- sectionTitles: string[]
- suggestedFrameTitles: string[]
`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert engineering report writer. Generate professional, concise titles for engineering report sections and frame headers.'
        },
        {
          role: 'user',
          content: content
        }
      ],
      model: 'llama-3.1-70b-versatile',
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    return {
      projectTitle: result.projectTitle || projectName || 'Engineering Field Report',
      sectionTitles: result.sectionTitles || ['Executive Summary', 'Field Observations', 'Documentation Photos'],
      suggestedFrameTitles: result.suggestedFrameTitles || ['ENGINEERING REPORT', 'EXECUTIVE SUMMARY', 'FIELD OBSERVATIONS', 'DOCUMENTATION PHOTOS']
    };
  } catch (error) {
    console.error('❌ AI frame title generation error:', error);
    
    // Fallback titles
    return {
      projectTitle: projectName || 'Engineering Field Report',
      sectionTitles: ['Executive Summary', 'Field Observations', 'Documentation Photos'],
      suggestedFrameTitles: ['ENGINEERING REPORT', 'EXECUTIVE SUMMARY', 'FIELD OBSERVATIONS', 'DOCUMENTATION PHOTOS']
    };
  }
}

export async function generateDynamicFrameTitle(
  content: string,
  pageType: 'cover' | 'summary' | 'observations' | 'photos' | 'analysis'
): Promise<string> {
  const pageContext = {
    cover: 'cover page with project overview',
    summary: 'executive summary section',
    observations: 'field observations and notes',
    photos: 'documentation photos section',
    analysis: 'technical analysis section'
  };

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Generate a concise, professional frame title for engineering reports. Keep it under 40 characters.'
        },
        {
          role: 'user',
          content: `Content: ${content}\nPage Type: ${pageContext[pageType]}\nGenerate a short frame title for the border header.`
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.2,
      max_tokens: 30
    });

    return completion.choices[0]?.message?.content?.trim() || 
           pageType.toUpperCase() + ' REPORT';
  } catch (error) {
    console.error('❌ AI dynamic frame title error:', error);
    return pageType.toUpperCase() + ' REPORT';
  }
}