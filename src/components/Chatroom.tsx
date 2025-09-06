import React, { useState, useEffect, useRef } from 'react';
import UsernameModal from './UsernameModal';
import socketService from '../services/socketService';
import { generateRoomId } from '../utils/roomUtils';

interface Message {
    id: string;
    username: string;
    text: string;
    timestamp: Date;
    isOwn: boolean;
    roomId?: string; // Room identifier
    sender?: string; // Sender's user ID
    readCount?: number; // Count of users who have read this message
}

interface User {
    id: string;
    username: string;
    joinedAt: Date;
    unreadCount?: number;
    isOnline?: boolean;
}


const Chatroom: React.FC = () => {
    const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [showUserList, setShowUserList] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState<string>('general'); // Track current room ID
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const currentUser = useRef<{ id: string, username: string }>({ id: '', username: '' });

    const currentRoomIdRef = useRef<string>(currentRoomId);
    // Show user list by default on desktop, hide on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                setShowUserList(true);
            } else {
                setShowUserList(false);
            }
        };

        // Set initial state
        handleResize();

        // Listen for resize events
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        currentRoomIdRef.current = currentRoomId;
    }, [currentRoomId])
    // Auto-hide user list on mobile when screen size changes
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setShowUserList(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when component mounts
    useEffect(() => {
        if (inputRef.current && !isUsernameModalOpen) {
            inputRef.current.focus();
        }
    }, [isUsernameModalOpen]);

    // Socket.IO connection and event listeners
    useEffect(() => {
        const socket = socketService.connect();

        // Connection status
        const handleConnect = () => {
            console.log('Connected to chat server');
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log('Disconnected from chat server');
            setIsConnected(false);
        };

        // Message handling
        const handleMessageReceived = (data: {
            id: string,
            message: string,
            timestamp: string,
            type: string,
            roomId: string,
            sender: string,
            readCount: number
        }) => {
            const user = users.find(user => user.id === data.sender);
            if (data.roomId === currentRoomIdRef.current) {
                const message: Message = {
                    id: data.id || Date.now().toString(),
                    username: user?.username || '',
                    text: data.message,
                    timestamp: new Date(data.timestamp || Date.now()),
                    isOwn: data.sender === currentUser.current.id,
                    roomId: data.roomId,
                    sender: data.sender,
                    readCount: data.readCount || 0
                };
                // Add message to current messages
                setMessages(prev => [...prev, message]);
            } else {
                setUsers(prev => {
                    return [...prev.map((p) => {
                        return p.id === data.sender ? { ...p, unreadCount: (p.unreadCount || 0) + 1 } : p
                    })]
                });
            }
        };

        // Message history
        const handleMessageHistory = (data: {
            roomId: string,
            selectedUser: string | null,
            recentMessages: {
                id: string,
                message: string,
                timestamp: string,
                type: string,
                roomId: string,
                sender: string,
                readCount: number
            }[]
        }) => {
            setSelectedUserId(data.selectedUser || null);
            setCurrentRoomId(data.roomId);

            if (inputRef.current) {
                inputRef.current.focus();
            }

            const formattedMessages = data.recentMessages.map(msg => {
                const user = users.find(user => user.id === msg.sender);
                return ({
                    id: msg.id,
                    username: user?.username || '',
                    text: msg.message,
                    timestamp: new Date(msg.timestamp),
                    isOwn: msg.sender === currentUser.current.id,
                    roomId: data.roomId,
                    sender: msg.sender,
                    readCount: msg.readCount || 0
                })
            });
            setMessages(formattedMessages);

            setUsers(prev => {
                return [...prev.map((p) => {
                    return p.id === data.selectedUser ? { ...p, unreadCount: 0 } : p
                })]
            });
        };

        // User management
        const handleUserJoined = (data: {
            id: string,
            username: string,
            unreadCount: number,
            isOnline: true,
            message: string
        }) => {
            const roomId = generateRoomId(currentUser.current.id, data.id);

            let updated = false;
            setUsers(prev => {
                return [...prev.map((p) => {
                    if (p.id === data.id) {
                        updated = true;
                        return {
                            ...p,
                            joinedAt: new Date(),
                            unreadCount: data.unreadCount || 0,
                            isOnline: true
                        }
                    }
                    return p;
                })]
            });
            if (!updated) {
                setUsers((prev) => [...prev, {
                    id: data.id,
                    username: data.username,
                    roomId: roomId,
                    joinedAt: new Date(),
                    unreadCount: data.unreadCount || 0,
                    isOnline: true
                }]);
            }
        };

        const handleUserLeft = (data: {
            id: string,
            message: string
        }) => {
            setUsers((prev) =>
                [...prev.map((user) => user.id !== data.id ? user : { ...user, isOnline: false })]
            );
        };

        const handleUserListUpdate = (userList: {
            id: string;
            roomId: string;
            username: string;
            unreadCount: number;
            isOnline: boolean
        }[]) => {
            const currentUserId = currentUser.current.id;
            const userObjects = userList
                .filter((user) => {
                    return user.id !== currentUserId;
                })
                .map((user) => {
                    return {
                        id: user.id,
                        username: user.username,
                        roomId: user.roomId,
                        joinedAt: new Date(),
                        unreadCount: user.unreadCount || 0,
                        isOnline: user.isOnline || false
                    };
                });
            setUsers([...userObjects]);
        };

        const handleJoinedChatroom = (data: {
            id: string;
            username: string;
            selectedUser: string | null;
            message: string;
            roomId: string;
            users: {
                id: string;
                roomId: string;
                username: string;
                unreadCount: number;
                isOnline: boolean
            }[],
            recentMessages: {
                id: string,
                message: string,
                timestamp: string,
                type: string,
                roomId: string,
                sender: string,
                readCount: number
            }[]
        }) => {
            currentUser.current = { id: data.id, username: data.username };
            localStorage.setItem('userInfo', JSON.stringify({ id: data.id, username: data.username }));
            if (data.users) {
                handleUserListUpdate(data.users);
            }
            if (data.recentMessages) {
                handleMessageHistory({
                    roomId: data.roomId,
                    selectedUser: data.selectedUser,
                    recentMessages: data.recentMessages
                });
            }
        };

        // Set up event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('message_received', handleMessageReceived);
        socket.on('message_history', handleMessageHistory);
        socket.on('joined_chatroom', handleJoinedChatroom);
        socket.on('user_joined', handleUserJoined);
        socket.on('user_left', handleUserLeft);

        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const userInfoObj = JSON.parse(userInfo);
            currentUser.current = { id: userInfoObj.id, username: userInfoObj.username };
            socketService.joinChatroom(userInfoObj.id, userInfoObj.username);
        } else {
            setIsUsernameModalOpen(true);
        }

        // Cleanup on unmount
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('message_received', handleMessageReceived);
            socket.off('message_history', handleMessageHistory);
            socket.off('joined_chatroom', handleJoinedChatroom);
            socket.off('user_joined', handleUserJoined);
            socket.off('user_left', handleUserLeft);
            socketService.disconnect();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleUsernameSubmit = (enteredUsername: string) => {
        setIsUsernameModalOpen(false);
        socketService.joinChatroom('', enteredUsername);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !isConnected) {
            return;
        }

        const messageToSend = newMessage.trim();
        // Send message via Socket.IO using current room ID
        socketService.sendMessage(messageToSend, currentRoomId);
        setNewMessage('');
    };

    const handleUserClick = (user: User) => {
        if (user.id !== currentUser.current.id) {
            socketService.selectUser(user.id);
        }
    };

    const handleGeneralChat = () => {
        socketService.selectUser(null);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };


    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-yellow-400 animate-pulse">
                                💬 90s Chatroom
                            </h1>
                            <div className="hidden md:flex items-center space-x-3 text-sm">
                                <div className={`px-3 py-1  ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white font-bold`}>
                                    {isConnected ? '🟢 ONLINE' : '🔴 OFFLINE'}
                                </div>
                                <div className="text-cyan-400">
                                    👤 {currentUser.current.username || 'Anonymous'}
                                </div>
                                <div className="text-pink-400">
                                    👥 {users.length} online
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1 sm:space-x-2 md:hidden">
                            <button
                                onClick={() => setShowUserList(!showUserList)}
                                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-2 sm:px-4 py-1 sm:py-2 font-bold hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,255,255,0.3)] text-xs sm:text-sm"
                            >
                                {showUserList ? '👥 Hide' : '👥 Users'}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Stats */}
                    <div className="md:hidden flex items-center justify-center space-x-2 sm:space-x-4 text-xs sm:text-sm mt-1 sm:mt-2">
                        <div className={`px-1 sm:px-2 py-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                            {isConnected ? '🟢' : '🔴'}
                        </div>
                        <div className="text-cyan-400">👤 {currentUser.current.username}</div>
                        <div className="text-pink-400">👥 {users.length}</div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-2 sm:p-4">
                <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-100px)] sm:h-[calc(100vh-120px)]">
                    {/* User List Sidebar - Desktop Only */}
                    <div className={`${showUserList ? 'block' : 'hidden'} hidden lg:block w-80 bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-sm border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.2)] overflow-hidden`}>
                        <div className="p-4 border-b border-cyan-400/30">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-yellow-400">
                                    👥 Online Users ({users.length})
                                </h3>
                            </div>
                        </div>

                        <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                            {users.map((user, index) => (
                                <div
                                    key={index}
                                    className={`group p-3 border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${user.id === currentUser.current.id
                                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-400 text-green-400 shadow-[0_0_15px_rgba(0,255,0,0.2)]'
                                        : selectedUserId === user.id
                                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.2)]'
                                            : user.isOnline
                                                ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/50 text-purple-300 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                                                : 'bg-gradient-to-r from-gray-500/5 to-gray-600/5 border-gray-500/30 text-gray-400 opacity-60'
                                        }`}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10  bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center text-lg font-bold text-white">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-sm">{user.username}</span>
                                                    <div className="flex items-center space-x-1">
                                                        <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                                        <span className="text-xs opacity-70">
                                                            {user.isOnline ? 'Online' : 'Offline'}
                                                        </span>
                                                    </div>
                                                    {user.id === currentUser.current.id && (
                                                        <span className="text-xs bg-green-500 text-black px-2 py-0.5  font-bold">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs opacity-70">
                                                        {formatTime(user.joinedAt)}
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        {(user.unreadCount || 0) > 0 && (
                                                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 font-bold">
                                                                {user.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}
                                            className="opacity-0 group-hover:opacity-100 bg-cyan-500 hover:bg-cyan-600 text-black px-2 py-1  text-xs font-bold transition-all duration-300"
                                            disabled={user.id === currentUser.current.id}
                                        >
                                            @
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {users.length === 0 && (
                                <div className="text-center text-gray-400 py-8">
                                    <div className="text-4xl mb-2">👻</div>
                                    <p className="text-sm">No other users online</p>
                                    <p className="text-xs mt-1">You're the only one here!</p>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-sm border-2 border-cyan-400  shadow-[0_0_25px_rgba(0,255,255,0.2)] overflow-hidden">
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-cyan-500/90 to-purple-500/90 p-2 sm:p-4 border-b border-cyan-400/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500  animate-pulse"></div>
                                    <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                                        {selectedUserId ? `🔒 Private Chat with ${users.find(user => user.id === selectedUserId)?.username}` : '💬 General Chat - 90s Style'}
                                    </h2>
                                </div>
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                    {selectedUserId && (
                                        <button
                                            onClick={handleGeneralChat}
                                            className="px-2 sm:px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-black text-xs font-bold  transition-colors"
                                        >
                                            General
                                        </button>
                                    )}
                                    <div className="text-xs sm:text-sm text-white/80">
                                        {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 bg-black/10 custom-scrollbar relative">
                            {(() => {
                                const currentMessages = messages;

                                if (currentMessages.length === 0) {
                                    return (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center text-gray-400">
                                                <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 animate-bounce">💭</div>
                                                <p className="text-sm sm:text-lg font-bold mb-1 sm:mb-2">
                                                    {selectedUserId ? `Private chat with ${selectedUserId}` : 'Welcome to the 90s Chatroom!'}
                                                </p>
                                                <p className="text-xs sm:text-sm">
                                                    {selectedUserId ? 'Start a private conversation! 🔒' : 'Start the conversation and let the nostalgia flow! 🚀'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <>
                                        {currentMessages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} group`}
                                            >
                                                <div
                                                    className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl overflow-wrap-anywhere ${message.isOwn
                                                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-br-md'
                                                        : message.username === 'System'
                                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-bl-md'
                                                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-bl-md'
                                                        }`}
                                                >
                                                    {message.username !== 'System' && (
                                                        <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                                                            <span className="text-xs font-bold opacity-90">
                                                                {message.username}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="text-xs sm:text-sm leading-relaxed break-words whitespace-pre-wrap">
                                                        {message.text.split(' ').map((word, index) => {
                                                            if (word.startsWith('@')) {
                                                                return (
                                                                    <span key={index} className="text-yellow-300 font-bold bg-yellow-400/20 px-1 ">
                                                                        {word}
                                                                    </span>
                                                                );
                                                            }
                                                            return word + ' ';
                                                        })}
                                                    </div>
                                                    <div className="text-xs mt-1 sm:mt-2 opacity-70">
                                                        {formatTime(message.timestamp)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                );
                            })()}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Mobile User List Overlay - Over Messages */}
                        <div className={`${showUserList ? 'block' : 'hidden'} lg:hidden absolute inset-0 z-20 bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-sm border-2 border-cyan-400  shadow-[0_0_25px_rgba(0,255,255,0.2)] overflow-hidden`}>
                            <div className="p-3 border-b border-cyan-400/30">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-yellow-400">
                                        👥 Online Users ({users.length})
                                    </h3>
                                    <button
                                        onClick={() => setShowUserList(false)}
                                        className="text-gray-400 hover:text-white transition-colors p-2  hover:bg-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <div className="p-3 space-y-3 h-[calc(100%-80px)] overflow-y-auto custom-scrollbar">
                                {users.map((user, index) => (
                                    <div
                                        key={index}
                                        className={`group p-3  border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${user.id === currentUser.current.id
                                            ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-400 text-green-400 shadow-[0_0_15px_rgba(0,255,0,0.2)]'
                                            : selectedUserId === user.id
                                                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.2)]'
                                                : user.isOnline
                                                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/50 text-purple-300 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                                                    : 'bg-gradient-to-r from-gray-500/5 to-gray-600/5 border-gray-500/30 text-gray-400 opacity-60'
                                            }`}
                                        onClick={() => {
                                            handleUserClick(user);
                                            setShowUserList(false); // Close overlay after selection
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10  bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center text-lg font-bold text-white">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-sm">{user.username}</span>
                                                        <div className="flex items-center space-x-1">
                                                            <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                                            <span className="text-xs opacity-70">
                                                                {user.isOnline ? 'Online' : 'Offline'}
                                                            </span>
                                                        </div>
                                                        {user.id === currentUser.current.id && (
                                                            <span className="text-xs bg-green-500 text-black px-2 py-0.5  font-bold">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs opacity-70">
                                                            {formatTime(user.joinedAt)}
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            {(user.unreadCount || 0) > 0 && (
                                                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 font-bold">
                                                                    {user.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowUserList(false); // Close overlay after mention
                                                }}
                                                className="opacity-0 group-hover:opacity-100 bg-cyan-500 hover:bg-cyan-600 text-black px-2 py-1  text-xs font-bold transition-all duration-300"
                                                disabled={user.id === currentUser.current.id}
                                            >
                                                @
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {users.length === 0 && (
                                    <div className="text-center text-gray-400 py-8">
                                        <div className="text-4xl mb-2">👻</div>
                                        <p className="text-sm">No other users online</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="p-2 sm:p-4 border-t border-cyan-400/30 bg-gradient-to-r from-gray-800/50 to-purple-800/50">
                            {selectedUserId && (
                                <div className="mb-2 sm:mb-3 flex items-center justify-between bg-yellow-400/20 border border-yellow-400/50  p-2 sm:p-3">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <span className="text-yellow-400 text-xs sm:text-sm font-bold">
                                            Replying to:
                                        </span>
                                        <span className="text-yellow-300 font-bold text-xs sm:text-sm">
                                            @{users.find(user => user.id === selectedUserId)?.username}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedUserId(null)}
                                        className="text-yellow-400 hover:text-white transition-colors p-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSendMessage} className="flex space-x-2 sm:space-x-3">
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={selectedUserId ? `Private message to ${users.find(user => user.id === selectedUserId)?.username}...` : "Type your message here... (Press Enter to send)"}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-black/60 border-2 border-cyan-400/50  sm: text-white placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:shadow-[0_0_15px_rgba(255,255,0,0.3)] transition-all duration-300 text-sm sm:text-base"
                                        disabled={!isConnected}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!isConnected || !newMessage.trim()}
                                    className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold  sm: hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(0,255,0,0.3)] min-w-[60px] sm:min-w-[100px] text-xs sm:text-sm"
                                >
                                    Send 🚀
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Username Modal */}
            <UsernameModal
                isOpen={isUsernameModalOpen}
                onClose={() => { }}
                onUsernameSubmit={handleUsernameSubmit}
            />
        </div>
    );
};

export default Chatroom;
