
import React, { useState } from 'react';
import { FlagrLogo } from '../constants';
import { User } from '../types';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }
        setError('');
        // Mock login - in a real app, this would be an API call
        const mockUser: User = {
            id: `user_${username.toLowerCase().replace(/[^a-z0-9]/gi, '_')}`,
            username: username,
            email: `${username.toLowerCase()}@flagr.ai`,
            avatarUrl: `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${username}`
        };
        onLogin(mockUser);
    };

    return (
        <div className="flex items-center justify-center min-h-screen w-screen bg-transparent text-gray-300">
            <div className="w-full max-w-md p-8 space-y-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl glass-pane">
                <div className="text-center">
                    <div className="inline-block mb-6">
                       <FlagrLogo showText={true} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                    <p className="text-gray-400 mt-2">Sign in to continue to Flagr</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="text-sm font-medium text-gray-400">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-2 block w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spotify focus:border-spotify transition"
                            placeholder="enter_your_username"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                             <label htmlFor="password" className="text-sm font-medium text-gray-400">Password</label>
                             <a href="#" className="text-sm text-spotify hover:underline">Forgot password?</a>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 block w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-spotify focus:border-spotify transition"
                            placeholder="••••••••"
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-spotify hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-spotify transition-all duration-300 transform active:scale-95"
                        >
                            Log In
                        </button>
                    </div>
                </form>
                <p className="text-center text-sm text-gray-400">
                    Don't have an account? <a href="#" className="font-medium text-spotify hover:underline">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
