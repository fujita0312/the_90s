import React, { useState, useEffect, useRef } from 'react';
import UsernameModal from './UsernameModal';
import socketService from '../services/socketService';

interface Message {
    id: string;
    username: string;
    text: string;
    timestamp: Date;
    isOwn: boolean;
    recipient?: string; // For private messages
}

interface User {
    username: string;
    joinedAt: Date;
}


const Chatroom: React.FC = () => {
    const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(true);
    const [username, setUsername] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [showUserList, setShowUserList] = useState(false);
    const [privateChats, setPrivateChats] = useState<Map<string, Message[]>>(new Map());
    const [currentChat, setCurrentChat] = useState<string | null>(null); // null = general chat
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const usernameRef = useRef<string>('');

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
    }, [messages, privateChats, currentChat]);

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
        const handleMessageReceived = (data: any) => {
            console.log('Message received:', data); // Debug log
            const message: Message = {
                id: data.id || Date.now().toString(),
                username: data.username,
                text: data.message,
                timestamp: new Date(data.timestamp || Date.now()),
                isOwn: data.username === usernameRef.current,
                recipient: data.recipient
            };

            if (data.recipient) {
                // Private message
                console.log('Adding private message to chat:', data.recipient);
                setPrivateChats(prev => {
                    const newMap = new Map(prev);
                    const chatKey = data.recipient === usernameRef.current ? data.username : data.recipient;
                    const existingMessages = newMap.get(chatKey) || [];
                    newMap.set(chatKey, [...existingMessages, message]);
                    return newMap;
                });
            } else {
                // General message
                console.log('Adding general message');
                setMessages(prev => [...prev, message]);
            }
        };

        // Message history
        const handleMessageHistory = (historyMessages: any[]) => {
            setMessages(prev => {
                const formattedMessages = historyMessages.map(msg => ({
                    id: msg.id,
                    username: msg.username,
                    text: msg.message,
                    timestamp: new Date(msg.timestamp),
                    isOwn: msg.username === usernameRef.current
                }));
                return formattedMessages;
            });
        };

        // User management
        const handleUserJoined = (data: any) => {
            const systemMessage: Message = {
                id: `system-${Date.now()}`,
                username: 'System',
                text: `${data.username} joined the chat! 🎉`,
                timestamp: new Date(),
                isOwn: false
            };
            setMessages(prev => [...prev, systemMessage]);
        };

        const handleUserLeft = (data: any) => {
            const systemMessage: Message = {
                id: `system-${Date.now()}`,
                username: 'System',
                text: `${data.username} left the chat 👋`,
                timestamp: new Date(),
                isOwn: false
            };
            setMessages(prev => [...prev, systemMessage]);
        };

        const handleUserListUpdate = (userList: string[]) => {
            console.log('User list updated:', userList); // Debug log
            const userObjects = userList
                .filter(name => name !== usernameRef.current) // Remove self from user list
                .map(name => ({
                    username: name,
                    joinedAt: new Date()
                }));
            setUsers(userObjects);
        };

        const handlePrivateChatHistory = (data: { otherUser: string; messages: any[] }) => {
            const formattedMessages = data.messages.map(msg => ({
                id: msg.id,
                username: msg.username,
                text: msg.message,
                timestamp: new Date(msg.timestamp),
                isOwn: msg.username === usernameRef.current,
                recipient: msg.recipient
            }));
            
            setPrivateChats(prev => {
                const newMap = new Map(prev);
                newMap.set(data.otherUser, formattedMessages);
                return newMap;
            });
        };

        // Set up event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('message_received', handleMessageReceived);
        socket.on('message_history', handleMessageHistory);
        socket.on('private_chat_history', handlePrivateChatHistory);
        socket.on('user_joined', handleUserJoined);
        socket.on('user_left', handleUserLeft);
        socket.on('user_list_update', handleUserListUpdate);

        // Cleanup on unmount
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('message_received', handleMessageReceived);
            socket.off('message_history', handleMessageHistory);
            socket.off('private_chat_history', handlePrivateChatHistory);
            socket.off('user_joined', handleUserJoined);
            socket.off('user_left', handleUserLeft);
            socket.off('user_list_update', handleUserListUpdate);
            socketService.disconnect();
        };
    }, []); // Remove username dependency

    // Handle username-dependent logic
    useEffect(() => {
        if (username) {
            usernameRef.current = username;
            // Join the chatroom when username is set
            socketService.joinChatroom(username);
        }
    }, [username]);

    const handleUsernameSubmit = (enteredUsername: string) => {
        setUsername(enteredUsername);
        setIsUsernameModalOpen(false);

        // Add welcome message
        const welcomeMessage: Message = {
            id: Date.now().toString(),
            username: 'System',
            text: `Welcome to the chatroom, ${enteredUsername}! 🎉`,
            timestamp: new Date(),
            isOwn: false
        };
        setMessages([welcomeMessage]);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !isConnected) {
            console.log('Cannot send message:', { newMessage: newMessage.trim(), isConnected });
            return;
        }

        const messageToSend = newMessage.trim();
        console.log('Sending message:', { messageToSend, currentChat, username });

        // Send message via Socket.IO
        if (currentChat) {
            // Private message
            console.log('Sending private message to:', currentChat);
            socketService.sendPrivateMessage(messageToSend, username, currentChat);
        } else {
            // General message
            console.log('Sending general message');
            socketService.sendMessage(messageToSend, username);
        }
        
        setNewMessage('');
        setSelectedUser(null);
    };

    const handleUserClick = (user: User) => {
        if (user.username !== username) {
            setSelectedUser(user.username);
            setCurrentChat(user.username);
            
            // Load private chat history
            socketService.loadPrivateChat(user.username);
            
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const handleGeneralChat = () => {
        setCurrentChat(null);
        setSelectedUser(null);
    };

    const handleMentionUser = (user: User) => {
        if (user.username !== username) {
            const mention = `@${user.username} `;
            setNewMessage(prev => prev + mention);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getRandom90sEmoji = () => {
        const emojis = ['😎', '🤘', '🔥', '💯', '🎮', '📞', '💿', '🌟', '⚡', '🎵'];
        return emojis[Math.floor(Math.random() * emojis.length)];
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
                                    👤 {username || 'Anonymous'}
                                </div>
                                <div className="text-pink-400">
                                    👥 {users.length} online
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1 sm:space-x-2">
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
                        <div className="text-cyan-400">👤 {username}</div>
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
                                <button
                                    onClick={() => setShowUserList(false)}
                                    className="text-gray-400 hover:text-white transition-colors p-1"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                            {users.map((user, index) => (
                                <div
                                    key={index}
                                    className={`group p-3 border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${user.username === username
                                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-400 text-green-400 shadow-[0_0_15px_rgba(0,255,0,0.2)]'
                                        : selectedUser === user.username
                                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.2)]'
                                            : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/50 text-purple-300 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                                        }`}
                                    onClick={() => handleUserClick(user)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10  bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center text-lg">
                                                {getRandom90sEmoji()}
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-bold text-sm">{user.username}</span>
                                                    {user.username === username && (
                                                        <span className="text-xs bg-green-500 text-black px-2 py-0.5  font-bold">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs opacity-70">
                                                    {formatTime(user.joinedAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMentionUser(user);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 bg-cyan-500 hover:bg-cyan-600 text-black px-2 py-1  text-xs font-bold transition-all duration-300"
                                            disabled={user.username === username}
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


                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-sm border-2 border-cyan-400  shadow-[0_0_25px_rgba(0,255,255,0.2)] overflow-hidden">
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-cyan-500/90 to-purple-500/90 p-2 sm:p-4 border-b border-cyan-400/30">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500  animate-pulse"></div>
                                    <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                                        {currentChat ? `🔒 Private Chat with ${currentChat}` : '💬 General Chat - 90s Style'}
                                    </h2>
                                </div>
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                    {currentChat && (
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
                                const currentMessages = currentChat ? (privateChats.get(currentChat) || []) : messages;
                                
                                if (currentMessages.length === 0) {
                                    return (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center text-gray-400">
                                                <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 animate-bounce">💭</div>
                                                <p className="text-sm sm:text-lg font-bold mb-1 sm:mb-2">
                                                    {currentChat ? `Private chat with ${currentChat}` : 'Welcome to the 90s Chatroom!'}
                                                </p>
                                                <p className="text-xs sm:text-sm">
                                                    {currentChat ? 'Start a private conversation! 🔒' : 'Start the conversation and let the nostalgia flow! 🚀'}
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
                                        className={`group p-3  border-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${user.username === username
                                            ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 border-green-400 text-green-400 shadow-[0_0_15px_rgba(0,255,0,0.2)]'
                                            : selectedUser === user.username
                                                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(255,255,0,0.2)]'
                                                : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400/50 text-purple-300 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                                            }`}
                                        onClick={() => {
                                            handleUserClick(user);
                                            setShowUserList(false); // Close overlay after selection
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10  bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center text-lg">
                                                    {getRandom90sEmoji()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-sm">{user.username}</span>
                                                        {user.username === username && (
                                                            <span className="text-xs bg-green-500 text-black px-2 py-0.5  font-bold">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs opacity-70">
                                                        {formatTime(user.joinedAt)}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMentionUser(user);
                                                    setShowUserList(false); // Close overlay after mention
                                                }}
                                                className="opacity-0 group-hover:opacity-100 bg-cyan-500 hover:bg-cyan-600 text-black px-2 py-1  text-xs font-bold transition-all duration-300"
                                                disabled={user.username === username}
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
                            {selectedUser && (
                                <div className="mb-2 sm:mb-3 flex items-center justify-between bg-yellow-400/20 border border-yellow-400/50  p-2 sm:p-3">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <span className="text-yellow-400 text-xs sm:text-sm font-bold">
                                            Replying to:
                                        </span>
                                        <span className="text-yellow-300 font-bold text-xs sm:text-sm">
                                            @{selectedUser}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedUser(null)}
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
                                        placeholder={currentChat ? `Private message to ${currentChat}...` : "Type your message here... (Press Enter to send)"}
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
                onClose={() => setIsUsernameModalOpen(false)}
                onUsernameSubmit={handleUsernameSubmit}
            />
        </div>
    );
};

export default Chatroom;
