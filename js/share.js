const shareImageAsset = async ({blobImageAsset, title, text, url}) => {
    const filesArray = [
      new File([blobImageAsset], `${title}.png`, {
        type: 'image/png',
        lastModified: new Date().getTime(),
      }),
    ];
    const shareData = {
      title: `${title}`,
      url: `${url}`,
      /// text: `${text}`,
      files: filesArray,
    };

    try {
      await navigator.share(shareData);
    } catch (error) {
      console.error('Share failed:', error);
      throw error;
    }
  };