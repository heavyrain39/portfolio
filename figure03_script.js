document.addEventListener('DOMContentLoaded', () => {
    const saveButton = document.getElementById('save-btn');
    const captureArea = document.getElementById('capture-area');
    const themeButtons = document.querySelectorAll('.theme-switcher button');
    const body = document.body;

    // 테마를 설정하고 로컬 스토리지에 저장하는 함수
    const setTheme = (themeName) => {
        body.dataset.theme = themeName;
        localStorage.setItem('figure03-theme', themeName);
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
    };

    // 테마 버튼에 클릭 이벤트 리스너 추가
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            setTheme(button.dataset.theme);
        });
    });

    // 페이지 로드 시 저장된 테마를 불러오거나 기본 테마 설정
    const savedTheme = localStorage.getItem('figure03-theme') || 'default-light';
    setTheme(savedTheme);

    // '이미지로 저장하기' 버튼 클릭 이벤트 처리
    saveButton.addEventListener('click', () => {
        saveButton.innerText = '이미지 생성 중...';
        saveButton.disabled = true;

        // html2canvas를 사용하여 지정된 영역을 캡처
        html2canvas(captureArea, {
            scale: 2, // 고해상도 출력을 위해 2배율로 캡처
            useCORS: true,
            // 현재 테마의 배경색을 캡처 이미지의 배경으로 사용
            backgroundColor: getComputedStyle(body).getPropertyValue('--color-background')
        }).then(canvas => {
            // 캡처된 캔버스를 PNG 이미지 URL로 변환
            const imageURL = canvas.toDataURL('image/png');
            
            // 다운로드 링크를 동적으로 생성하여 클릭
            const downloadLink = document.createElement('a');
            downloadLink.href = imageURL;
            downloadLink.download = 'Figure03_경제_영향_분석.png';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            saveButton.innerText = '이 분석 내용 이미지로 저장하기';
            saveButton.disabled = false;
        }).catch(err => {
            console.error("Image capture failed:", err);
            alert("이미지 생성에 실패했습니다. 콘솔을 확인해주세요.");
            saveButton.innerText = '오류 발생! 다시 시도하세요.';
            saveButton.disabled = false;
        });
    });
});