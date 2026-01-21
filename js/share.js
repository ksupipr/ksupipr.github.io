const shareImageAsset = async ({blobImageAsset, title, text, url, imageUrl}) => {
    // На iOS Safari navigator.canShare может отсутствовать, но navigator.share работает
    // iOS Safari не поддерживает files в navigator.share, поэтому используем URL изображения
    
    // Если передан imageUrl, используем его напрямую (лучший вариант для iOS)
    if (imageUrl) {
      const shareData = {
        title: title || '',
        text: text || '',
        url: imageUrl,
      };
      
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        console.error('Share failed:', error);
        throw error;
      }
    }
    
    // Пробуем с файлами (работает на Android и некоторых браузерах)
    const filesArray = [
      new File([blobImageAsset], `${title || 'image'}.png`, {
        type: 'image/png',
        lastModified: new Date().getTime(),
      }),
    ];
    
    const shareDataWithFiles = {
      title: title || '',
      url: url || '',
      text: text || '',
      files: filesArray,
    };

    // Если canShare доступен, проверяем
    if (navigator.canShare) {
      if (navigator.canShare(shareDataWithFiles)) {
        try {
          await navigator.share(shareDataWithFiles);
          return;
        } catch (error) {
          // Если share с файлами не работает, пробуем fallback
          console.warn('Share with files failed, trying fallback:', error);
        }
      }
    } else {
      // На iOS Safari canShare может отсутствовать, пробуем share напрямую
      try {
        await navigator.share(shareDataWithFiles);
        return;
      } catch (error) {
        // Если files не поддерживается (например, на iOS), пробуем с URL
        console.warn('Share with files failed, trying URL fallback:', error);
      }
    }
    
    // Fallback: создаем data URL из blob (может работать на iOS)
    const reader = new FileReader();
    const dataUrl = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blobImageAsset);
    });
    
    const shareDataFallback = {
      title: title || '',
      text: text || '',
      url: url || dataUrl,
    };
    
    await navigator.share(shareDataFallback);
  };