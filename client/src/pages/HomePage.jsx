import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
function HomePage() {
  const [query, setQuery] = useState('');
  const [events, setEvents] = useState([]);
  console.log(query);
  console.log(events);

  useEffect(() => {
    const timer = setTimeout(() => {
      getEvents();
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  const getEvents = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/events?searchQuery=${query}`
      );
      console.log(res.data.data);
      setEvents(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div>
      <input
        onChange={(e) => setQuery(e.target.value)}
        className="pl-11 pr-4 w-64 bg-luma-black/30 border-white/[0.08] focus:border-luma-blue focus:ring-1 focus:ring-luma-blue h-12 text-base rounded-[14px] placeholder:text-luma-text-gray transition-all disabled:opacity-50"
        placeholder="Search Here"
      />

      <div>
        {events?.map((event) => (
          <div>
            <p>title : {event.title}</p>
            <p>Description : {event.description}</p>
            <p>Location :{event.schedule.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
