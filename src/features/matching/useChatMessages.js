/**
 * useChatMessages.js
 * 
 * Hook para manejar mensajes del chat inline en la pantalla de matching
 */

import { db } from "@/firebaseconfig";
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where
} from "firebase/firestore";
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export const useChatMessages = (user, chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Cargar mensajes del chat
  useEffect(() => {
    if (!chatId || !user) {
      setMessages([]);
      return;
    }

    setLoading(true);
    console.log("🔍 Cargando mensajes para chat:", chatId);

    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messagesData);
      setLoading(false);
      console.log(`📨 Mensajes cargados para chat ${chatId}:`, messagesData.length);
      messagesData.forEach((msg, index) => {
        console.log(`  ${index + 1}. ${msg.senderName}: ${msg.text}`);
      });
    }, (error) => {
      console.error("❌ Error cargando mensajes:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, user]);

  // Enviar mensaje
  const sendMessage = async (messageText) => {
    if (!user || !chatId || !messageText.trim()) {
      Alert.alert("Error", "No se puede enviar el mensaje");
      return false;
    }

    try {
      setSending(true);
      
      const messageData = {
        chatId: chatId,
        senderId: user.uid,
        senderName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        senderPhoto: user.photoURL,
        text: messageText.trim(),
        createdAt: serverTimestamp(),
        isRead: false
      };

      console.log(`📤 Enviando mensaje a chat ${chatId}:`, messageData);
      await addDoc(collection(db, "messages"), messageData);
      console.log("✅ Mensaje enviado exitosamente:", messageText);
      return true;
    } catch (error) {
      console.error("❌ Error enviando mensaje:", error);
      Alert.alert("Error", "No se pudo enviar el mensaje");
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage
  };
};

