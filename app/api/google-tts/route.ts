import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_TTS_API_KEY = 'AIzaSyCw3Gau5fIRKyhux7fSFhY87x3hRJmlBTo'

export async function POST(request: NextRequest) {
  try {
    const { text, language = 'fr-FR', voice = 'fr-FR-Wavenet-A', speakingRate = 0.9, pitch = 0.0, volumeGainDb = 0.0 } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    const requestBody = {
      input: { text },
      voice: {
        languageCode: language,
        name: voice,
        ssmlGender: 'FEMALE'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: speakingRate,
        pitch: pitch,
        volumeGainDb: volumeGainDb
      }
    }

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Google TTS API Error:', errorData)
      return NextResponse.json(
        { error: 'Google TTS API error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Convert base64 audio to blob
    const audioData = data.audioContent
    const audioBuffer = Buffer.from(audioData, 'base64')
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Google TTS Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
