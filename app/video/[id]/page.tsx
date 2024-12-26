import { Metadata } from 'next';
import { Innertube } from 'youtubei.js/web';

interface PageProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const youtube = await Innertube.create({
    lang: 'en',
    location: 'US',
    retrieve_player: false,
  });

  const info = await youtube.getInfo(params.id);
  
  return {
    title: info.primary_info?.title.text,
    description: info.secondary_info?.description?.text || '',
  };
}

// Enable ISR with 1 hour revalidation
export const revalidate = 3600;

// You can pre-generate popular video pages
export async function generateStaticParams() {
  return [
    { id: 'popular-video-id-1' },
    { id: 'popular-video-id-2' },
  ];
}

export default async function VideoPage({ params }: PageProps) {
  return (
    <div>
      {/* You can move your video player and other components here */}
      <iframe
        src={`https://www.youtube.com/embed/${params.id}`}
        className="w-full aspect-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
