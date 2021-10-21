import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
}

type AuthContextData = {
    signOut: () => void;
    user: User | null;
    signInUrl: string;
}

type AuthResponse = {
    token: string;
    user: {
        id: string;
        avatar_url: string;
        name: string;
        login: string;
    }
}

export const AuthContext = createContext({} as AuthContextData)



type AuthProvider = {
    children: ReactNode;
}


export function AuthProvider(props: AuthProvider) {
    const [user, setUser] = useState<User | null>(null)
    const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=7f8caf6c64812a1e0ab3`

    function signOut () {
        setUser(null)
        localStorage.removeItem('@token:heat')
    }

    async function signIn(github: string) {
        const data_user = await api.post<AuthResponse>('/signin', {
            code: github
        })

        const { token, user } = data_user.data
        
        localStorage.setItem('@token:heat', token)
        api.defaults.headers.common.authorization = `Bearer ${token}`
        setUser(user)
    }

    useEffect(() => {
        const token = localStorage.getItem('@token:heat')

        if(token) {
            api.defaults.headers.common.authorization = `Bearer ${token}`
            
            api.get<User>('profile').then(res => {
                setUser(res.data)
            })
        }
    }, [])

    useEffect(() => {
        const url = window.location.href
        const hasGithubCode = url.includes('?code=')

        if(hasGithubCode) {
            const [urlWithOutCode, githubCode] = url.split('?code=')
            window.history.pushState({}, '', urlWithOutCode)

            signIn(githubCode)
        }
    }, [])
    
    return (
        <AuthContext.Provider value={{ signInUrl, user, signOut}}>
            {props.children}
        </AuthContext.Provider>
    )
}