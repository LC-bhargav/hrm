import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Megaphone, Plus, X } from 'lucide-react';
import { Announcement } from '@/types';

interface AnnouncementsWidgetProps {
    announcements: Announcement[];
    isAdmin: boolean;
    onPostAnnouncement: (title: string, content: string) => void;
}

export const AnnouncementsWidget: React.FC<AnnouncementsWidgetProps> = ({
    announcements,
    isAdmin,
    onPostAnnouncement
}) => {
    const [isPosting, setIsPosting] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && content) {
            onPostAnnouncement(title, content);
            setTitle('');
            setContent('');
            setIsPosting(false);
        }
    };

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 mb-6">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Megaphone className="text-blue-600" size={20} />
                    Company Announcements
                </CardTitle>
                {isAdmin && !isPosting && (
                    <Button onClick={() => setIsPosting(true)}>
                        <Plus size={16} className="mr-1" /> Post New
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isPosting ? (
                    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-sm text-slate-700">New Announcement</h4>
                            <button type="button" onClick={() => setIsPosting(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 text-sm border border-slate-200 rounded"
                            required
                        />
                        <textarea
                            placeholder="Message content..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-2 text-sm border border-slate-200 rounded"
                            rows={3}
                            required
                        />
                        <div className="flex justify-end">
                            <Button type="submit">Post Announcement</Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-3">
                        {announcements.slice(0, 3).map((ann) => (
                            <div key={ann.id} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-blue-800">{ann.title}</h4>
                                    <span className="text-xs text-slate-400">{ann.date}</span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">{ann.content}</p>
                                <div className="text-xs text-slate-400 mt-2 text-right">- {ann.author}</div>
                            </div>
                        ))}
                        {announcements.length === 0 && (
                            <p className="text-sm text-slate-500 italic text-center py-2">No active announcements.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
