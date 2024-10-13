import React, { useEffect, useState } from 'react';
import { FaUser, FaPrescriptionBottle } from 'react-icons/fa';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase-config'; // Ensure correct path to firebase config
import './Dashboard.css'; // Ensure this CSS file is correctly imported
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import Recharts components
import Calendar from 'react-calendar'; // Import react-calendar
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

const Dashboard = () => {
    const [patientCount, setPatientCount] = useState(0);
    const [prescriptionCount, setPrescriptionCount] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // For calendar date selection

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Count the number of documents in the Appointments collection using their IDs
                const appointmentsCollection = collection(db, 'Appointments');
                const appointmentsSnapshot = await getDocs(appointmentsCollection);
                const appointmentIds = appointmentsSnapshot.docs.map(doc => doc.id); // Get document IDs
                setPatientCount(appointmentIds.length); // Set patient count based on the number of document IDs

                // Fetch Prescription Count from the Prescriptions collection
                const prescriptionsCollection = collection(db, 'prescriptions');
                const prescriptionsSnapshot = await getDocs(prescriptionsCollection);
                setPrescriptionCount(prescriptionsSnapshot.size); // Count of prescriptions

                // Fetch chart data for prescriptions by weekday
                const prescriptionsByDay = {
                    Monday: 0,
                    Tuesday: 0,
                    Wednesday: 0,
                    Thursday: 0,
                    Friday: 0,
                    Saturday: 0,
                    Sunday: 0,
                };

                prescriptionsSnapshot.docs.forEach(prescription => {
                    const prescriptionDate = new Date(prescription.data().prescriptionDate.seconds * 1000);
                    const weekday = getWeekdayName(prescriptionDate); // Get weekday name

                    if (prescriptionsByDay[weekday] !== undefined) {
                        prescriptionsByDay[weekday] += 1; // Count prescriptions for each weekday
                    }
                });

                const chartData = Object.keys(prescriptionsByDay).map(weekday => ({
                    weekday,
                    prescriptions: prescriptionsByDay[weekday],
                }));

                setChartData(chartData);
            } catch (error) {
                console.error("Error fetching data: ", error);
            }
        };

        fetchCounts(); // Call the fetchCounts function to get the data

    }, []);

    const getWeekdayName = (date) => {
        const options = { weekday: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(date); // e.g., "Monday", "Tuesday"
    };

    return (
        <div className="dashboard">
            <div className="stats">
                <div className="stat-item">
                    <FaUser size={50} /> {/* Icon for Patients */}
                    <div>
                        <div>{patientCount}</div> {/* Dynamic Patient Count based on Appointments document IDs */}
                        <div>Patients</div>
                    </div>
                </div>
                <div className="stat-item">
                    <FaPrescriptionBottle size={50} /> {/* Icon for Prescriptions */}
                    <div>
                        <div>{prescriptionCount}</div> {/* Dynamic Prescription Count */}
                        <div>Prescriptions</div>
                    </div>
                </div>
            </div>

            <div className="charts">
                <div className="chart-calendar-container"> {/* Flex container to hold both chart and calendar */}
                    <div className="chart">
                        <h3>Weekly Progress</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="weekday" /> {/* Use 'weekday' as X-axis dataKey */}
                                <YAxis domain={[1, 50]} /> {/* Set Y-axis range from 1 to 50 */}
                                <Tooltip />
                                <Bar dataKey="prescriptions" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="calendar-container">
                        <h3>Calendar </h3>
                        <Calendar
                            onChange={setSelectedDate}
                            value={selectedDate} // Selected date
                        />
                        <p>Selected date: {selectedDate.toDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
