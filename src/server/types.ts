export interface User {
    id: string;
    profile: {
        name: string;
        surname: string;
        birthDate: string;
        email: string;
        avatar: string;
    };
    role: 'admin' | 'user';
    status: 'pending' | 'active' | 'blocked';
    registrationDate: string;
    friends: string[];
}

export interface Post {
    id: string;
    authorId: string;
    author?: User;
    content: string;
    photo?: string;
    date: string;
    likes: string[];
}
