import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js/web';

// Fungsi untuk mengkonversi detik ke format mm:ss
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export async function POST(request: Request) {
  try {
    // Parse request body
    const { videoId } = await request.json();
    console.log('Received Video ID:', videoId); // Verifikasi videoId yang diterima

    // Validasi input
    if (!videoId) {
      return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
    }

    // Inisialisasi Innertube dengan konfigurasi
    const youtube = await Innertube.create({
      lang: 'en', // Bahasa default
      location: 'US', // Lokasi default
      retrieve_player: false, // Tidak perlu mengambil player
    });

    // Ambil informasi video
    const info = await youtube.getInfo(videoId);

    // Ambil judul video
    const title = info.primary_info?.title.text;

    // Ambil data transkrip
    const transcriptData = await info.getTranscript();

    // Format transkrip dengan timestamp
    const segments = transcriptData?.transcript?.content?.body?.initial_segments.map(
      (segment: any) => ({
        startTime: segment.start_ms / 1000, // Konversi ms ke detik
        endTime: segment.end_ms / 1000, // Konversi ms ke detik
        text: segment.snippet?.text?.trim(), // Teks transkrip
      })
    );

    // Jika tidak ada transkrip, kembalikan pesan error
    if (!segments) {
      return NextResponse.json({ error: 'Transcript not available' }, { status: 404 });
    }

    // Kelompokkan transkrip ke dalam interval 30 detik
    const groupedSegments = segments.reduce((acc: any[], segment: any) => {
      const intervalStart = Math.floor(segment.startTime / 30) * 30; // Bulatkan ke interval 30 detik
      const intervalEnd = intervalStart + 30;

      // Cari atau buat grup untuk interval ini
      let group = acc.find((g) => g.startTime === intervalStart);
      if (!group) {
        group = {
          startTime: intervalStart,
          endTime: intervalEnd,
          text: [],
        };
        acc.push(group);
      }

      // Tambahkan teks ke grup
      group.text.push(segment.text);

      return acc;
    }, []);

    // Format grup untuk respons
    const formattedSegments = groupedSegments.map((group) => ({
      timeRange: `${formatTime(group.startTime)} - ${formatTime(group.endTime)}`, // Format waktu
      text: group.text.join(' ').replace(/\s+/g, ' '), // Gabungkan teks dan hilangkan spasi berlebih
    }));

    // Kembalikan judul dan transkrip yang diformat sebagai respons JSON
    const response = await NextResponse.json({ title, segments: formattedSegments });

    // Add cache headers
    response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    
    return response;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 });
  }
}