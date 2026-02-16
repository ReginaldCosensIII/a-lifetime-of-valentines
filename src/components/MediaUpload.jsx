
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MediaUpload({ coupleId, onUploadComplete, demoMode, onDemoAction }) {
    const [uploading, setUploading] = useState(false);
    const [caption, setCaption] = useState('');
    const [eventYear, setEventYear] = useState(new Date().getFullYear());

    const handleUpload = async (event) => {
        if (demoMode) {
            event.preventDefault();
            if (onDemoAction) onDemoAction();
            return;
        }

        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${coupleId}/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Determine type
            const type = file.type.startsWith('image/') ? 'image' : 'video';

            // 3. Insert into Media table (with Year)
            const { error: dbError } = await supabase.from('media').insert([
                {
                    couple_id: coupleId,
                    user_id: (await supabase.auth.getUser()).data.user.id,
                    type: type,
                    storage_path: filePath,
                    caption: caption,
                    event_year: eventYear // Linking to year
                }
            ]);

            if (dbError) {
                throw dbError;
            }

            alert('Uploaded successfully!');
            setCaption('');
            setEventYear(new Date().getFullYear());
            if (onUploadComplete) onUploadComplete();

        } catch (error) {
            console.error('Error uploading:', error);
            alert('Error uploading file: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="media-upload-container">
            <h3>Add a Memory 📸</h3>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <input
                    type="text"
                    placeholder="Caption (optional)"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem' }}
                />
                <input
                    type="number"
                    placeholder="Year"
                    value={eventYear}
                    onChange={(e) => setEventYear(e.target.value)}
                    style={{ width: '80px', padding: '0.5rem' }}
                />
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Option 1: Standard File Picker (Gallery) */}
                {/* Option 1: Standard File Picker (Gallery) */}
                <label className="upload-button upload-btn-gallery">
                    <span>📁</span> {uploading ? 'Uploading...' : 'Gallery'}
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>

                {/* Option 2: Take Photo (Environment/Rear Camera) */}
                <label className="upload-button upload-btn-camera">
                    <span>📷</span> {uploading ? 'Uploading...' : 'Take Photo'}
                    <input
                        type="file"
                        accept="image/*"
                        capture="environment" // Forces camera on mobile
                        onChange={handleUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>

                {/* Option 3: Record Video (Environment/Rear Camera) */}
                <label className="upload-button upload-btn-video">
                    <span>🎥</span> {uploading ? 'Uploading...' : 'Record Video'}
                    <input
                        type="file"
                        accept="video/*"
                        capture="environment" // Forces video camera on mobile
                        onChange={handleUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>
        </div>
    );
}
