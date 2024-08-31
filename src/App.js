import React, { useState, useRef, useEffect } from "react";
import {
  FaMicrophone,
  FaPause,
  FaPlay,
  FaTrash,
  FaPaperPlane,
  FaPlus,
} from "react-icons/fa";
import "./App.css";

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRefs = useRef({});

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings([
          ...recordings,
          {
            url: audioUrl,
            speed: 1,
            currentTime: 0,
            duration: recordingDuration,
          },
        ]);
        audioChunksRef.current = [];
        setRecordingDuration(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePause = () => {
    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setIsPaused(!isPaused);
  };

  const deleteRecording = () => {
    if (isRecording) {
      stopRecording();
    }

    setRecordings((prevRecordings) => prevRecordings.slice(0, -1));
    setRecordingDuration(0);
  };

  const sendRecording = () => {
    if (isRecording) {
      stopRecording();
    }
  };

  const changeSpeed = (index) => {
    const newRecordings = [...recordings];
    const speeds = [1, 1.5, 2];
    const currentSpeedIndex = speeds.indexOf(newRecordings[index].speed);
    newRecordings[index].speed =
      speeds[(currentSpeedIndex + 1) % speeds.length];
    setRecordings(newRecordings);

    if (audioRefs.current[index]) {
      audioRefs.current[index].playbackRate = newRecordings[index].speed;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="w-full sm:w-[95%] lg:w-[40%] border-2 border-black p-4 rounded-lg bg-white h-[70vh] relative overflow-hidden">
        <div className="overflow-y-scroll mb-12">
          {recordings.map((recording, index) => (
            <div
              key={index}
              className="bg-gray-200 p-2 mb-2 rounded flex items-center"
            >
              <button
                onClick={() => changeSpeed(index)}
                className="bg-red-200 rounded-full w-8 h-8 flex items-center justify-center mr-2"
              >
                {recording.speed}x
              </button>
              <audio
                ref={(el) => (audioRefs.current[index] = el)}
                controls
                src={recording.url}
                style={{ width: "calc(100% - 40px)" }}
                onPlay={() => {
                  if (audioRefs.current[index]) {
                    audioRefs.current[index].playbackRate = recording.speed;
                  }
                }}
              />
            </div>
          ))}
        </div>
        <div className="h-[15%] bg-gray-300 p-2 flex items-center rounded absolute bottom-5 w-[92%]">
          {!isRecording ? (
            <div className="flex gap-2 w-full">
              <button className="mr-2">
                <FaPlus />
              </button>
              <input
                type="text"
                className="flex-grow mr-2 p-1 rounded"
                placeholder="Type a message..."
              />
              <button onClick={startRecording} className="ml-auto">
                <FaMicrophone />
              </button>
            </div>
          ) : (
            <div className="flex w-full">
              <button onClick={deleteRecording} className="mr-5">
                <FaTrash />
              </button>
              <div className="flex-grow flex items-center w-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-5"></div>
                <span className="mr-8">{formatTime(recordingDuration)}</span>
                <span className="mr-2">
                  {isPaused ? "Paused" : "Recording"}
                </span>
                <div className="flex justify-between gap-7 ml-auto">
                  <button onClick={togglePause} className="mr-2">
                    {isPaused ? <FaMicrophone /> : <FaPause />}
                  </button>
                </div>
                <button onClick={sendRecording}>
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AudioRecorder;
