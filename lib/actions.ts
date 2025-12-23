

export const playNotificationSound = () => {
    const audio=new Audio('/long-expected-548.mp3')
    if (audio) {
      audio!.play().catch((error) => {
        console.error('Failed to play sound:', error);
      });
    }
  };
