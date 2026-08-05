import { TrackClient } from './TrackClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function TrackTransactionPage() {
  return (
    <div className='min-h-screen bg-black text-white relative overflow-hidden'>
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <TrackClient />
    </div>
  );
}
