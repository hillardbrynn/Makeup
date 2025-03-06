export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return new Response('Missing URL parameter', { status: 400 });
    }
    
    try {
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();
      
      return new Response(imageBlob, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=86400' // Cache for a day
        }
      });
    } catch (error) {
      console.error('Error fetching image:', error);
      return new Response('Failed to fetch image', { status: 500 });
    }
  }