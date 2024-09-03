"use client";

import { ExpenseByCategorySummary, useGetExpensesByCategoryQuery } from "@/state/api";
import { useMemo, useState } from "react";
import Header from "@/app/(components)/Header";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type AggregatedDataItem = {
    name: string;
    color: string;
    amount: number;
}

type AggregatedData = {
    [category: string]: AggregatedDataItem
}

const Expenses = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const { data: expensesData, isLoading, isError } = useGetExpensesByCategoryQuery();

    const expenses = useMemo(() => expensesData ?? [], [expensesData]);

    const parseDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toISOString().split("T")[0];
    }

    const aggregatedData: AggregatedDataItem[] = useMemo(() => {
        const filtered: AggregatedData = expenses.filter((data: ExpenseByCategorySummary) => {
            const matchesCategory = selectedCategory === "All" || data.category === selectedCategory;
            const dataDate = parseDate(data.date)
            const matchesDate = !startDate || !endDate || (dataDate >= startDate && dataDate <= endDate);
            return matchesCategory && matchesDate;
        }).reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
            const amount = parseInt(data.amount);
            if (!acc[data.category]) {
                acc[data.category] = { name: data.category, amount: 0, color:""};
                acc[data.category].color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                acc[data.category].amount =amount;
            }
            return acc;
        },{})
        return Object.values(filtered);
    }, [expenses,selectedCategory, startDate,endDate])

    const classNames = {
        label: 'block text-sm font-semibold text-gray-700',
        selectInput: "mt-2 block w-full pl-3 outline pr-1 py-2 text-gray-500 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
    }

    if (isLoading) {
        return <div className="py-4">Loading...</div>;
    }

    if (isError || !expensesData) {
        return (
            <div className="text-center text-red-500 py-4">
                Failed to fetch Expenses
            </div>
        );
    }
    return (
        <div>
            <div className="mb-5">
                <Header name="Expenses" />
                <p className="text-sm text-gray-500">A visual representation of expense over time.</p>
            </div>
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="w-full md:w-1/3 bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Filter by Category & Date</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="category" className={classNames.label}>Category</label>
                            <select name="category" id="catogory" defaultValue="All" className={classNames.selectInput} onChange={(e) => setSelectedCategory(e.target.value)}>
                                <option value="All">All</option>
                                <option value="All">Office</option>
                                <option value="All">Professional</option>
                                <option value="All">Salaries</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="start-date" className={classNames.label}>Start Date</label>
                            <input type="date" id="start-date" name="start-date" className={classNames.selectInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="end-date" className={classNames.label}>End Date</label>
                            <input type="date" id="end-date" name="end-date" className={classNames.selectInput} value={endDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                    </div>
                </div>
                {/* Chart */}
                <div className="flex-grow bg-white shadow rounded-lg p-4 md:p-6">
                    <ResponsiveContainer height={350}>
                        <PieChart>
                            <Pie
                                data={aggregatedData}
                                cx="50%"
                                cy="50%"
                                label
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="amount"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                            >
                                {aggregatedData.map((entry:AggregatedDataItem,index:number) => (
                                    <Cell key={`cell-${index}`} fill={index === activeIndex ? "rgb(29,78,216)" : entry.color}/>
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default Expenses