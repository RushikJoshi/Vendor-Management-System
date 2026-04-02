import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register ChartJS modules
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const MonthlyVendorChart = ({ data }) => {
    const chartData = {
        labels: data.map((item) => item.month),
        datasets: [
            {
                label: "Vendors Joined",
                data: data.map((item) => item.count),
                backgroundColor: "rgba(59, 130, 246, 0.6)", // Tailwind Blue-500 with opacity
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1,
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: "Monthly Vendor Growth",
                font: {
                    size: 16,
                    weight: "bold",
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <div className="h-72 w-full">
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default MonthlyVendorChart;
