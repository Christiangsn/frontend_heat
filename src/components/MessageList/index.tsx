import { useEffect, useState } from 'react'
import io from 'socket.io-client'
import { api } from '../../services/api'
import styles from './styles.module.scss'
import logo from '../../assets/logo.svg'

type User = {
    name: string;
    avatar_url: string;
}

type messages = {
    id: string;
    text: string;
    user: User
}

const messagesQueue: messages[] = [];

const socket = io('http://localhost:4000')
socket.on('new_message', (newMessage: messages) => {
    console.log(newMessage)
})

export function MessageList () {
    const [messages, setMessages] = useState<messages[]>([])

    useEffect(() => {
        setInterval(() => {
            if(messagesQueue.length > 0) {
                setMessages(oldState => [
                    messagesQueue[0],
                    oldState[0],
                    oldState[1]
                ].filter(Boolean))
                messagesQueue.shift()
            }
        },3000 )
    }, [])

    useEffect(() => {
        api.get<messages[]>('/messages/3')
            .then( messages => {
                setMessages(messages.data)
            })
    }, [])

    return(
        <div className={styles.messageListWrapper}>
            <img src={logo} alt="DoWhile 2021" />

            <ul className={styles.messageList}>

            {messages.map(message => {
                return (
                    <li key={message.id} className={styles.message}>
                    <p className={styles.messageContent}>{message.text}</p>
                    <div className={styles.messageUser}>
                        <div className={styles.userImage}>
                            <img src={message.user.avatar_url} alt={message.user.name} />
                        </div>
                        <span>{message.user.name}</span>
                    </div>
                </li>
                )
            })}

            </ul>
        </div>
    )
}