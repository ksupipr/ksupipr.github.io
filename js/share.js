const shareImageAsset = async (blobImageAsset, title, url) => {
    const filesArray = [
      new File([blobImageAsset], `${title}.png`, {
        type: 'image/png',
        lastModified: new Date().getTime(),
      }),
    ];
    const shareData = {
      title: `${title}`,
      url: url,
      files: filesArray,
    };

    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    }
  };