import React from "react";

const StatCard = ({ title, value, icon, bgColor, textColor }) => {
    return (
        <div className={`p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 ${bgColor}`}>
            <div className={`p-3 rounded-lg ${textColor} bg-white bg-opacity-30`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );
};

export default StatCard;
