import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../providers/authProvider';
import { VARS } from '../utils/env';


export const useWebSocket = () => {
    const {wsToken,logout} = useAuth()

    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<WebSocketMessage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const reconnectAttempts = useRef(0);
    const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
    const isMounted = useRef(true);

    // Función para enviar mensajes
    const sendMessage = useCallback(async (message: object) => {
        if (socketRef.current) {
            if (socketRef.current.readyState < 2){
                socketRef.current.send(JSON.stringify(message));
            }else{
                await connect()
                socketRef.current.send(JSON.stringify(message));
            }
        }
    }, [isConnected]);

    const closeSocket= useCallback(() => {
        socketRef.current?.close()
    }, []);

    const connect = useCallback(() => {
        if (!wsToken) {
            setError('No authentication token provided');
            return;
        }

        if (socketRef.current) {
            if (socketRef.current.readyState < 2) return;
        }

        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }


        const socket = new WebSocket(VARS.WS_URL);
        socketRef.current = socket;

        socket.onopen = () => {
            setIsConnected(true);
            setError(null);
            reconnectAttempts.current = 0;
            reconnectTimer.current = null
            // Enviar token inmediatamente después de abrir

            socket.send(wsToken);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data?.status==409){
                    socketRef.current?.close(1000,"Another connection")
                    logout()
                }
                setMessages(prev => [...prev, data]);
            } catch (e) {
                console.error('Error parsing message:', e);
            }
        };

        socket.onerror = (error) => {
            setError('WebSocket error');
            console.log('WebSocket error:', error);
        };

        socket.onclose = (event) => {
            console.log(reconnectAttempts.current)
            if (event.code === 1000) {
                alert("Se ha detectado otra sesion")
                logout()
                return;
            }

            if (event.code==1008){
                window.location.reload()
            }
            if (event.code==1005){
                return
            }
            // Intentar reconexión automática
            if (isMounted.current && reconnectAttempts.current < 5) {
                reconnectAttempts.current += 1;
                
                const delay = 4000;
                // const delay = Math.min(
                //     3000 * Math.pow(2, reconnectAttempts.current - 1),
                //     30000 // Máximo 30 segundos
                // );
                
                reconnectTimer.current = setTimeout(() => {
                    if (isMounted.current) {
                        console.log(`Reconnecting attempt ${reconnectAttempts.current}...`);
                        connect();
                    }
                }, delay);
            } else {
                setError('Max reconnect attempts reached');
                window.location.reload()
            }

            setIsConnected(false);
            setError('Connection closed');
        };

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    },[]);

    useEffect(() => {
        isMounted.current = true;
        connect();

    }, [connect]);

    return {
        isConnected,
        messages,
        error,
        connect,
        sendMessage,
        closeSocket
    };
};