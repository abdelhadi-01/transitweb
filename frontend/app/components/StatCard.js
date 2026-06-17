'use client';

export default function StatCard({ title, value, icon: Icon, color, change, changeType }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );
}