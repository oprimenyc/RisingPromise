import React, { useState } from 'react';
import { CheckCircle, RotateCcw, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Device {
  id: string;
  content: string;
}

interface Category {
  id: string;
  name: string;
  correctId: string;
}

interface Answer {
  id: string;
  content: string;
  matchedDevice: Device | null;
}

const MobileDeviceCategoryQuiz: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([
    { id: 'laptop', content: 'Dell Latitude Business Laptop' },
    { id: 'tablet', content: 'iPad Pro with Keyboard' },
    { id: 'smartphone', content: 'Samsung Galaxy S23' },
    { id: 'wearable', content: 'Apple Watch Series 9' },
  ]);

  const [categories] = useState<Category[]>([
    { id: 'cat-1', name: 'Full portable computer with keyboard', correctId: 'laptop' },
    { id: 'cat-2', name: 'Touch-based, bridges phone and laptop', correctId: 'tablet' },
    { id: 'cat-3', name: 'Pocket computer that makes calls', correctId: 'smartphone' },
    { id: 'cat-4', name: 'Syncs with phone, worn on body', correctId: 'wearable' },
  ]);

  const [answers, setAnswers] = useState<Answer[]>(
    categories.map(cat => ({ id: cat.id, content: '', matchedDevice: null }))
  );
  
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [draggedItem, setDraggedItem] = useState<Device | null>(null);
  const [attempts, setAttempts] = useState<number>(0);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Device) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetCategoryId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newAnswers = [...answers];
    const targetIndex = newAnswers.findIndex(a => a.id === targetCategoryId);
    
    // Return previously placed device to available devices
    if (newAnswers[targetIndex].matchedDevice) {
      setDevices(prev => [...prev, newAnswers[targetIndex].matchedDevice!]);
    }
    
    newAnswers[targetIndex] = {
      ...newAnswers[targetIndex],
      content: draggedItem.content,
      matchedDevice: draggedItem,
    };
    setAnswers(newAnswers);

    // Remove dragged device from available devices
    setDevices(prev => prev.filter(d => d.id !== draggedItem.id));
    setDraggedItem(null);
  };

  const checkAnswer = () => {
    setAttempts(prev => prev + 1);
    const isAllCorrect = answers.every(answer => {
      const correspondingCategory = categories.find(c => c.id === answer.id);
      return correspondingCategory && correspondingCategory.correctId === answer.matchedDevice?.id;
    });
    setIsCorrect(isAllCorrect);
    
    // WIOA tracking - log quiz attempts and completion
    const quizData = {
      type: 'mobile_device_category_quiz',
      module: 'Module 1',
      section: 'Section 1.1 - Introduction to Mobile Devices',
      attempts: attempts + 1,
      success: isAllCorrect,
      timestamp: new Date().toISOString(),
      studentAnswers: answers.map(a => ({
        category: categories.find(c => c.id === a.id)?.name,
        selectedDevice: a.matchedDevice?.content || 'None',
        correct: categories.find(c => c.id === a.id)?.correctId === a.matchedDevice?.id
      }))
    };
    
    console.log('WIOA Quiz Tracking:', quizData);
    
    // Store in localStorage for WIOA compliance reporting
    const existingData = JSON.parse(localStorage.getItem('wioaQuizData') || '[]');
    existingData.push(quizData);
    localStorage.setItem('wioaQuizData', JSON.stringify(existingData));
  };

  const resetQuiz = () => {
    setDevices([
      { id: 'laptop', content: 'Dell Latitude Business Laptop' },
      { id: 'tablet', content: 'iPad Pro with Keyboard' },
      { id: 'smartphone', content: 'Samsung Galaxy S23' },
      { id: 'wearable', content: 'Apple Watch Series 9' },
    ]);
    setAnswers(categories.map(cat => ({ id: cat.id, content: '', matchedDevice: null })));
    setIsCorrect(null);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 my-8 max-w-4xl mx-auto">
      {/* Header with patriotic styling */}
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-red-600 rounded-lg flex items-center justify-center mr-3">
          <Target className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Interactive Learning: Mobile Device Categories
        </h3>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Drag each device example to match it with the correct category description. 
        This hands-on exercise helps reinforce your understanding of mobile device classifications.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Devices */}
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
            Available Devices
          </h4>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 min-h-[200px]">
            {devices.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                className="p-3 m-2 rounded-lg bg-white dark:bg-gray-700 border-2 border-blue-300 dark:border-blue-600 shadow-sm cursor-grab hover:border-red-400 dark:hover:border-red-500 hover:shadow-md transition-all duration-200 text-gray-800 dark:text-gray-200"
                data-testid={`device-${item.id}`}
              >
                {item.content}
              </div>
            ))}
            {devices.length === 0 && (
              <div className="flex items-center justify-center h-full text-center">
                <div className="text-green-600 dark:text-green-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">All devices placed!</p>
                  <p className="text-sm">Ready to check your answers</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Drop Zones */}
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            <span className="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
            Device Categories
          </h4>
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div
                key={category.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.id)}
                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-colors duration-200"
                data-testid={`category-${category.id}`}
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {category.name}
                </p>
                <div className="min-h-[50px] bg-white dark:bg-gray-700 rounded-lg flex items-center p-3 border border-gray-300 dark:border-gray-600">
                  {answers[index].content ? (
                    <span className="text-gray-800 dark:text-gray-200 font-medium">
                      {answers[index].content}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">
                      Drop device here
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls and Feedback */}
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-3">
          <Button
            onClick={checkAnswer}
            disabled={devices.length > 0}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
            data-testid="button-check-answer"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Check Answer
          </Button>
          <Button
            onClick={resetQuiz}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors duration-200"
            data-testid="button-reset-quiz"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Quiz
          </Button>
        </div>

        {/* Results Feedback */}
        {isCorrect !== null && (
          <div className="text-right">
            <p className={`font-bold text-lg ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? '✓ Excellent work! All correct!' : '✗ Not quite right. Try again!'}
            </p>
            {!isCorrect && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Hint: Consider the primary function and portability of each device
              </p>
            )}
            {isCorrect && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                You've mastered mobile device categorization!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Progress Tracking */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Learning Progress Tracked for WIOA Compliance</span>
          <span>Attempts: {attempts}</span>
        </div>
      </div>
    </div>
  );
};

export default MobileDeviceCategoryQuiz;