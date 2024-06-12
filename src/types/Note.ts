export interface User {
    name: string,
    username: string,
}

export interface Place {
    geo: {
        bbox: number[],
    },
    id: string,
    name: string,
}

export interface NoteRaw {
    userId:string,
    id: string,
    text: string,
    date: string,

}

export interface NoteStream {
    timestamp: string,
    includes: {
        places: Place[], users: User[], notes: NoteRaw[]
    },
}

export interface Geotag {
    id: string,
    name: string,
    coordinates: {
        lat: number,
        long: number
    }
}

export interface NoteFormatted {
    userId: string,
    userName: string,
    text: string,
    geo: Geotag
}