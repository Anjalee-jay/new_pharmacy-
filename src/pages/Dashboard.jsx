import React, { useEffect, useState } from 'react';
import { FaUser, FaPrescriptionBottle } from 'react-icons/fa';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase-config'; // Ensure correct path to firebase config
import './Dashboard.css'; // Ensure this CSS file is correctly imported
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // Import Recharts components
import Calendar from 'react-calendar'; // Import react-calendar
import 'react-calendar/dist/Calendar.css'; // Import calendar styles
import CryptoJS from 'crypto-js'; // Import CryptoJS for decryption

// Use the provided decryption key
const DECRYPTION_KEY = '4x^6!m$7gQ&9n8F*r1zW@b5k0jL#3xD';

const Dashboard = () => {
    const [patientCount, setPatientCount] = useState(0);
    const [prescriptionCount, setPrescriptionCount] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date()); // For calendar date selection

    // Decryption function using AES
    const decryptData = (encryptedData) => {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, DECRYPTION_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted;
        } catch (error) {
            console.error('Error decrypting data: ', error);
            return null;
        }
    };

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Count the number of documents in the Appointments collection
                const appointmentsCollection = collection(db, 'Appointments');
                const appointmentsSnapshot = await getDocs(appointmentsCollection);
                const appointmentIds = appointmentsSnapshot.docs.map(doc => doc.id);
                setPatientCount(appointmentIds.length);

                // Fetch Prescription Count from the Prescriptions collection
                const prescriptionsCollection = collection(db, 'prescriptions');
                const prescriptionsSnapshot = await getDocs(prescriptionsCollection);
                setPrescriptionCount(prescriptionsSnapshot.size);

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
                    const prescriptionData = prescription.data();
                    const decryptedDate = decryptData(prescriptionData.prescriptionsDate); // Decrypt prescriptionsDate
                    const prescriptionsDate = new Date(decryptedDate); // Create Date object from decrypted data
                    const weekday = getWeekdayName(prescriptionsDate); // Get weekday name

                    // Check if the weekday is valid
                    if (prescriptionsByDay[weekday] !== undefined) {
                        prescriptionsByDay[weekday] += 1; // Increment count for that weekday
                    }
                });

                // Prepare chart data
                const chartData = Object.keys(prescriptionsByDay).map(weekday => ({
                    weekday,
                    prescriptions: prescriptionsByDay[weekday],
                }));

                console.log("Chart Data: ", chartData); // Log the chart data for debugging
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
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} margin={{ top: 30, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey='weekday' /> {/* Use 'weekday' as X-axis dataKey */}
                                <YAxis domain={[0, Math.max(...chartData.map(data => data.prescriptions), 30)]} /> {/* Set Y-axis range dynamically */}
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
