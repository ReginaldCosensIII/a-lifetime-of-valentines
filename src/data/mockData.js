export const mockData = {
    couple: {
        id: 'demo-couple-id',
        partner_1_name: 'Valentine',
        partner_2_name: 'Cupid',
        invite_code: 'DEMO-123'
    },
    timeline: [
        {
            id: 1,
            title: 'First Date 🍷',
            event_date: '2023-02-14',
            location: 'Le Petit Bistro',
            description: 'A magical evening at Le Petit Bistro.',
            icon: '🍷'
        },
        {
            id: 2,
            title: 'Movie Night 🍿',
            event_date: '2023-03-01',
            location: 'Starlight Drive-In',
            description: 'Vintage movie marathon under the stars.',
            icon: '🎬'
        },
        {
            id: 3,
            title: 'City Stroll 🌃',
            event_date: '2023-04-15',
            location: 'Downtown Promenade',
            description: 'Walking hand in hand through the city lights.',
            icon: '✨'
        }
    ],
    media: [
        {
            id: 1,
            url: '/mock/dinner-1.png', // Mapped to dinner.png
            caption: 'Our anniversary dinner ❤️',
            type: 'image',
            created_at: '2023-02-14T18:00:00Z'
        },
        {
            id: 2,
            url: '/mock/movie.png',
            caption: 'Cinema paradiso 🍿',
            type: 'image',
            created_at: '2023-03-01T20:00:00Z'
        },
        {
            id: 3,
            url: '/mock/bouquet.png',
            caption: 'Beautiful flowers from my love 🌹',
            type: 'image',
            created_at: '2023-02-14T09:00:00Z'
        },
        {
            id: 4,
            url: '/mock/toast.png',
            caption: 'Cheers to us! 🥂',
            type: 'image',
            created_at: '2023-12-31T23:59:00Z'
        },
        {
            id: 5,
            url: '/mock/dinner-2.png',
            caption: 'Just us two.',
            type: 'image',
            created_at: '2023-02-14T19:00:00Z'
        }
    ],
    messages: [
        {
            id: 1,
            message: "I love you more than words can say! Can't wait for our next adventure. ❤️",
            sender_id: 'partner-id',
            created_at: '2023-02-14T10:00:00Z'
        }
    ]
};
