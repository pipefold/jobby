import { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InterviewResponse, JSONResume } from '@/types/resume';
import { getQuestionsForSection, getNextSection } from '@/lib/resumeBuilder';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface InterviewChatProps {
  mode: 'text' | 'voice';
  onComplete: (responses: InterviewResponse[]) => void;
}

export default function InterviewChat({ mode, onComplete }: InterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [currentSection, setCurrentSection] = useState<keyof JSONResume>('basics');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Start interview with welcome message
    addBotMessage("Hi! I'm here to help you create your resume. Let's start with some basic information.");
    
    // Load first section's questions
    loadSection('basics');
  }, []);

  const loadSection = (section: keyof JSONResume) => {
    const sectionQuestions = getQuestionsForSection(section);
    setQuestions(sectionQuestions);
    setCurrentQuestionIndex(0);
    setCurrentSection(section);
    
    // Add section intro message
    const sectionNames: Record<string, string> = {
      basics: 'Basic Information',
      work: 'Work Experience',
      education: 'Education',
      skills: 'Skills',
      projects: 'Projects',
    };
    
    setTimeout(() => {
      addBotMessage(`Great! Let's talk about your ${sectionNames[section] || section}.`);
      askNextQuestion(sectionQuestions, 0);
    }, 500);
  };

  const addBotMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString() + Math.random(),
      text,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (text: string) => {
    const message: Message = {
      id: Date.now().toString() + Math.random(),
      text,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const askNextQuestion = (questionList: string[], index: number) => {
    if (index < questionList.length) {
      setTimeout(() => {
        addBotMessage(questionList[index]);
      }, 300);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userAnswer = inputText.trim();
    addUserMessage(userAnswer);
    
    // Save response
    const response: InterviewResponse = {
      question: questions[currentQuestionIndex],
      answer: userAnswer,
      section: currentSection,
    };
    
    const updatedResponses = [...responses, response];
    setResponses(updatedResponses);
    
    setInputText('');

    // Check if question is about adding another entry
    if (questions[currentQuestionIndex].toLowerCase().includes('add another')) {
      if (userAnswer.toLowerCase().includes('yes')) {
        // Ask the same section again (excluding the "add another" question)
        const nonRepeatQuestions = questions.filter(
          (q) => !q.toLowerCase().includes('add another')
        );
        setCurrentQuestionIndex(0);
        setTimeout(() => {
          addBotMessage("Great! Let's add another one.");
          askNextQuestion(nonRepeatQuestions, 0);
        }, 500);
        return;
      } else {
        // Move to next section
        moveToNextSection(updatedResponses);
        return;
      }
    }

    // Move to next question
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      askNextQuestion(questions, nextIndex);
    } else {
      // Section complete, move to next
      moveToNextSection(updatedResponses);
    }
  };

  const moveToNextSection = (currentResponses: InterviewResponse[]) => {
    const nextSection = getNextSection(currentSection);
    
    if (!nextSection) {
      // Interview complete
      setTimeout(() => {
        addBotMessage(
          "Perfect! We've gathered all the information for your resume. Let's save it!"
        );
        setTimeout(() => {
          onComplete(currentResponses);
        }, 1000);
      }, 500);
    } else {
      // Load next section
      setTimeout(() => {
        loadSection(nextSection);
      }, 500);
    }
  };

  const handleKeyPress = () => {
    // For future voice mode implementation
    if (mode === 'voice') {
      // TODO: Implement voice recording
      addBotMessage('Voice mode coming soon!');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.botBubble,
            ]}
          >
            <ThemedText
              style={[
                styles.messageText,
                message.isUser ? styles.userText : styles.botText,
              ]}
            >
              {message.text}
            </ThemedText>
            <ThemedText
              style={[
                styles.timestamp,
                message.isUser ? styles.userTimestamp : styles.botTimestamp,
              ]}
            >
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </ThemedText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        {mode === 'text' ? (
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your answer..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              onSubmitEditing={handleSendMessage}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <ThemedText style={styles.sendButtonText}>Send</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.voiceButton}
            onPress={handleKeyPress}
          >
            <ThemedText style={styles.voiceButtonText}>
              🎤 Hold to Record
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2089dc',
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#fff',
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#000',
    textAlign: 'left',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    padding: 10,
  },
  textInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#2089dc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  voiceButton: {
    backgroundColor: '#ff6b6b',
    padding: 20,
    borderRadius: 30,
    alignItems: 'center',
  },
  voiceButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

