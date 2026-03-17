import { Download, Plus } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 transition-colors">Dashboard Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Welcome back, Administrator. Here is what&apos;s happening in Mapandan today.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-[#2a3040] hover:bg-slate-100 dark:hover:bg-[#343b4f] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#3a4155] rounded-lg text-sm font-medium transition-colors shadow-sm dark:shadow-none">
                        <Download size={16} />
                        <span>Export Report</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
                        <Plus size={16} />
                        <span>Create Post</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Card 1 */}
                <div className="bg-white dark:bg-[#1e2330] rounded-xl p-6 border border-slate-200 dark:border-[#2a3040] relative overflow-hidden group shadow-sm dark:shadow-none transition-colors">
                    <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-700 opacity-20 transform group-hover:scale-110 transition-transform">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 transition-colors">Total Gallery Visitors (Est)</p>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">12,450</h2>
                    <div className="flex items-center text-xs">
                        <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded flex items-center font-medium transition-colors">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            15%
                        </span>
                        <span className="text-slate-500 ml-2 transition-colors">vs last month</span>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white dark:bg-[#1e2330] rounded-xl p-6 border border-slate-200 dark:border-[#2a3040] relative overflow-hidden group shadow-sm dark:shadow-none transition-colors">
                    <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-700 opacity-20 transform group-hover:scale-110 transition-transform">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 transition-colors">Active Job Postings</p>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">8</h2>
                    <div className="flex items-center text-xs">
                        <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded flex items-center font-medium transition-colors">
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            2%
                        </span>
                        <span className="text-slate-500 ml-2 transition-colors">vs last month</span>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white dark:bg-[#1e2330] rounded-xl p-6 border border-slate-200 dark:border-[#2a3040] relative overflow-hidden group shadow-sm dark:shadow-none transition-colors">
                    <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-700 opacity-20 transform group-hover:scale-110 transition-transform">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 transition-colors">Pending Public Reports</p>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">24</h2>
                    <div className="flex items-center text-xs">
                        <span className="bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 px-2 py-0.5 rounded flex items-center font-medium transition-colors">
                            ! Attention Needed
                        </span>
                    </div>
                </div>

                {/* Card 4 */}
                <div className="bg-white dark:bg-[#1e2330] rounded-xl p-6 border border-slate-200 dark:border-[#2a3040] relative overflow-hidden group shadow-sm dark:shadow-none transition-colors">
                    <div className="absolute top-4 right-4 text-slate-300 dark:text-slate-700 opacity-20 transform group-hover:scale-110 transition-transform">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 transition-colors">Active Projects</p>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 transition-colors">5</h2>
                    <div className="flex items-center text-xs">
                        <span className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded flex items-center font-medium transition-colors">
                            - Stable
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                {/* Quick Actions (Col-span 2) */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">Quick Actions</h3>
                    <div className="bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl flex flex-col shadow-sm dark:shadow-none transition-colors">

                        {/* Action 1 */}
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-[#2a3040] gap-4 transition-colors">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 transition-colors">
                                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-white font-medium mb-1 transition-colors">Manage Content</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Create new announcements regarding town hall meetings or local events.</p>
                                </div>
                            </div>
                            <button className="whitespace-nowrap px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                                Add New News Post
                            </button>
                        </div>

                        {/* Action 2 */}
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-[#2a3040] gap-4 transition-colors">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0 transition-colors">
                                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-white font-medium mb-1 transition-colors">Infrastructure Projects</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Update the progress bars and photos for ongoing road works.</p>
                                </div>
                            </div>
                            <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-[#2a3040] hover:bg-slate-100 dark:hover:bg-[#343b4f] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3a4155] rounded-lg text-sm font-medium transition-colors">
                                Update Project Progress
                            </button>
                        </div>

                        {/* Action 3 */}
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 transition-colors">
                                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-white font-medium mb-1 transition-colors">Gallery Highlights</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Feature a new local business or scenic spot on the homepage.</p>
                                </div>
                            </div>
                            <button className="whitespace-nowrap px-4 py-2 bg-white dark:bg-[#2a3040] hover:bg-slate-100 dark:hover:bg-[#343b4f] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3a4155] rounded-lg text-sm font-medium transition-colors">
                                Feature Spot
                            </button>
                        </div>

                    </div>
                </div>

                {/* Recent Activity (Col-span 1) */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Recent Activity</h3>
                        <button className="text-blue-600 dark:text-blue-500 text-sm hover:text-blue-500 dark:hover:text-blue-400 transition-colors">View All</button>
                    </div>

                    <div className="bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl p-5 shadow-sm dark:shadow-none transition-colors">
                        <ul className="space-y-5 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-slate-200 dark:before:bg-[#2a3040]">
                            <li className="relative pl-8">
                                <span className="absolute left-[8px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#1e2330] transition-colors"></span>
                                <p className="text-slate-700 dark:text-slate-300 text-sm transition-colors"><strong className="text-slate-900 dark:text-white">Maria Santos</strong> submitted a new public report regarding &quot;Street Light Repair&quot;.</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">10 minutes ago</p>
                            </li>
                            <li className="relative pl-8">
                                <span className="absolute left-[8px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-[#1e2330] transition-colors"></span>
                                <p className="text-slate-700 dark:text-slate-300 text-sm transition-colors">New job application received for <strong className="text-slate-900 dark:text-white">Administrative Assistant</strong>.</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">2 hours ago</p>
                            </li>
                            <li className="relative pl-8">
                                <span className="absolute left-[8px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white dark:ring-[#1e2330] transition-colors"></span>
                                <p className="text-slate-700 dark:text-slate-300 text-sm transition-colors">System backup completed successfully.</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">5 hours ago</p>
                            </li>
                            <li className="relative pl-8">
                                <span className="absolute left-[8px] top-1.5 w-2 h-2 rounded-full bg-orange-500 ring-4 ring-white dark:ring-[#1e2330] transition-colors"></span>
                                <p className="text-slate-700 dark:text-slate-300 text-sm transition-colors">Updated <strong className="text-slate-900 dark:text-white">Sabangan Beach</strong> details in Gallery module.</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 transition-colors">1 day ago</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Visitor Heatmap Placeholder */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 transition-colors">Visitor Heatmap</h3>
            <div className="bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-[#2a3040] rounded-xl overflow-hidden relative h-64 flex items-center justify-center shadow-sm dark:shadow-none transition-colors">
                {/* Abstract background map lines for styling effect */}
                <div className="absolute inset-x-0 bottom-0 h-full opacity-5 dark:opacity-10 transition-opacity" style={{ backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                <p className="text-slate-400 dark:text-slate-500 font-medium tracking-widest text-sm z-10 transition-colors">INTERACTIVE MAP UNAVAILABLE IN PREVIEW</p>

                {/* Fake pinpoint dots */}
                <div className="absolute top-1/3 left-1/4 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.7)]"></div>
                <div className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] flex items-center justify-center"><div className="w-1.5 h-1.5 bg-red-200 rounded-full"></div></div>
                <div className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.6)]"></div>
            </div>

        </div>
    );
}
