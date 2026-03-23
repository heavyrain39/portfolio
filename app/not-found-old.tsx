import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[90vh] container mx-auto px-6 relative z-10 text-center">
            
            {/* Minimal Decorative Elements */}
            <div className="absolute top-32 left-6 md:left-24 text-xs font-mono opacity-30 flex flex-col gap-1 items-start text-left select-none pointer-events-none">
                <span>ERR_COORD: 404</span>
                <span>STATUS: SIGNAL_LOST</span>
                <span>LOCATION: UNKNOWN</span>
            </div>

            <h1 className="text-8xl md:text-[10rem] font-serif font-bold tracking-tighter mb-12 leading-none select-none opacity-90 drop-shadow-sm">
                404
            </h1>
            
            {/* The Quote Block */}
            <div className="max-w-2xl mt-4 opacity-70 flex flex-col items-center select-none">
                <blockquote className="font-mono text-xs md:text-sm leading-relaxed text-justify break-words uppercase tracking-wide">
                    &quot;The spirit is so intimately connected with the roots of man&apos;s being that it powerfully and seductively leads him to believe he is the creator of the spirit, and that he possesses it. But in reality, it is the primordial phenomenon of the spirit that possesses man.&quot;
                </blockquote>
                <p className="mt-6 font-mono text-[10px] opacity-60 tracking-widest uppercase text-right w-full">
                    — C.G. Jung, <i>The Phenomenology of the Spirit in Fairy Tales</i> (1945)
                </p>
            </div>

            <Link 
                href="/" 
                className="mt-24 font-mono text-xs md:text-sm border-b border-foreground/50 pb-1 hover:opacity-50 transition-all uppercase tracking-[0.2em] font-medium"
            >
                Return to Surface
            </Link>
        </div>
    );
}
