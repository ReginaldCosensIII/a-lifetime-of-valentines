
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CollageView({ coupleId }) {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedia();
    }, [coupleId]);

    const fetchMedia = async () => {
        try {
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .eq('couple_id', coupleId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMedia(data);
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading memories...</div>;

    if (media.length === 0) {
        return <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No memories yet. Upload your first one!</div>;
    }

    return (
        <div className="bento-grid" style={{ padding: '0.5rem' }}>
            {media.map((item, index) => {
                const isSpanCol = index % 5 === 0;
                const isSpanRow = index % 7 === 0;

                return (
                    <div key={item.id} className={`bento-item ${isSpanCol ? 'span-2' : ''} ${isSpanRow ? 'row-2' : ''}`}>
                        {item.type === 'image' ? (
                            <img
                                src={supabase.storage.from('memories').getPublicUrl(item.storage_path).data.publicUrl}
                                alt={item.caption || 'Memory'}
                                loading="lazy"
                            />
                        ) : (
                            <video
                                src={supabase.storage.from('memories').getPublicUrl(item.storage_path).data.publicUrl}
                                muted loop
                                onMouseOver={e => e.target.play()}
                                onMouseOut={e => e.target.pause()}
                            />
                        )}
                        <div className="bento-overlay">
                            <div className="bento-caption">
                                <p style={{ margin: 0 }}>{item.caption || '❤️'}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
