import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './MediaManager.css'

export default function MediaManager({ coupleId, isOpen, onClose }) {
    const [media, setMedia] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedIds, setSelectedIds] = useState(new Set())
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        if (isOpen && coupleId) {
            fetchMedia()
            setSelectedIds(new Set())
        }
    }, [isOpen, coupleId])

    const fetchMedia = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('media')
                .select('*')
                .eq('couple_id', coupleId)
                .order('created_at', { ascending: false })

            if (error) throw error

            // Generate public URLs for all items
            const mediaWithUrls = data.map(item => {
                const { data: urlData } = supabase.storage.from('memories').getPublicUrl(item.storage_path)
                return {
                    ...item,
                    url: urlData.publicUrl
                }
            })

            setMedia(mediaWithUrls)
        } catch (error) {
            console.error('Error fetching media:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const handleDelete = async () => {
        if (selectedIds.size === 0) return
        if (!confirm(`Are you sure you want to delete ${selectedIds.size} items? This cannot be undone.`)) return

        setDeleting(true)
        try {
            const itemsToDelete = media.filter(m => selectedIds.has(m.id))
            const filePaths = itemsToDelete.map(m => m.storage_path) // Fixed: was file_path

            // 1. Delete from Storage
            const { error: storageError } = await supabase.storage
                .from('memories')
                .remove(filePaths)

            if (storageError) throw storageError

            // 2. Delete from Database
            const { error: dbError } = await supabase
                .from('media')
                .delete()
                .in('id', Array.from(selectedIds))

            if (dbError) throw dbError

            // Success
            fetchMedia()
            setSelectedIds(new Set())
        } catch (error) {
            console.error('Error deleting media:', error)
            alert('Failed to delete items: ' + error.message)
        } finally {
            setDeleting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="media-manager-overlay">
            <div className="media-manager-modal">

                {/* Header */}
                <div className="mm-header">
                    <div>
                        <h2>Media Manager</h2>
                        <p>{media.length} items • {selectedIds.size} selected</p>
                    </div>
                    <button onClick={onClose} className="btn-icon">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="mm-content">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading media...</div>
                    ) : media.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                            No photos or videos to manage.
                        </div>
                    ) : (
                        <div className="mm-grid">
                            {media.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => toggleSelection(item.id)}
                                    className={`mm-item ${selectedIds.has(item.id) ? 'selected' : ''}`}
                                >
                                    {item.type === 'video' ? (
                                        <video
                                            src={item.url}
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt={item.caption || 'Memory'}
                                            loading="lazy"
                                        />
                                    )}

                                    {/* Selection Overlay */}
                                    <div className="mm-overlay">
                                        <div className="mm-check">
                                            ✓
                                        </div>
                                    </div>

                                    {/* Video Indicator */}
                                    {item.type === 'video' && (
                                        <div className="mm-video-badge">
                                            🎥 Video
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="mm-footer">
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline' }}
                        disabled={selectedIds.size === 0}
                    >
                        Deselect All
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={selectedIds.size === 0 || deleting}
                        className="btn-delete"
                    >
                        {deleting ? 'Deleting...' : `Delete ${selectedIds.size} Items`}
                    </button>
                </div>
            </div>
        </div>
    )
}
