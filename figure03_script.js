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
        // 1. 버튼을 비활성화하고 사용자에게 현재 상태를 알림
        saveButton.innerText = '폰트 로딩 중...';
        saveButton.disabled = true;

        // 2. [핵심 해결책] 브라우저의 모든 폰트가 준비될 때까지 기다리는 Promise
        document.fonts.ready.then(() => {
            // 3. 폰트가 준비되면, 다시 한번 상태를 알림
            saveButton.innerText = '이미지 생성 중...';

            // 4. 이제 안전하게 html2canvas 실행
            html2canvas(captureArea, {
                scale: 2,
                useCORS: true,
                backgroundColor: getComputedStyle(body).getPropertyValue('--color-bg') // 배경색을 body에서 가져오도록 수정
            }).then(canvas => {
                const imageURL = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = imageURL;
                downloadLink.download = 'Figure03_경제_영향_분석.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }).catch(err => {
                // html2canvas 자체에서 에러가 발생한 경우
                console.error("Image capture failed:", err);
                alert("이미지 생성에 실패했습니다. 콘솔을 확인해주세요.");
            }).finally(() => {
                // 5. 성공하든 실패하든, 작업이 끝나면 버튼을 원래 상태로 복구
                saveButton.innerText = '이 분석 내용 이미지로 저장하기';
                saveButton.disabled = false;
            });

        }).catch(fontErr => {
            // 폰트 로딩 자체에서 에러가 발생한 경우 (예: 폰트 파일 경로 오류 등)
            console.error("Font loading failed:", fontErr);
            alert("폰트 로딩에 실패하여 이미지를 생성할 수 없습니다. 폰트 파일 경로를 확인해주세요.");
            saveButton.innerText = '폰트 로딩 실패! 다시 시도하세요.';
            saveButton.disabled = false;
        });
    });
});