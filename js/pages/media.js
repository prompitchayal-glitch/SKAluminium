/**
 * Media Page Controller
 * จัดการหน้ารูปภาพโครงการ
 */

document.addEventListener('DOMContentLoaded', function() {
    // State
    let projects = [];
    let mediaByProject = {};
    let currentImages = [];
    let currentImageIndex = 0;

    // DOM Elements
    const filterProject = document.getElementById('filterProject');
    const filterMediaType = document.getElementById('filterMediaType');
    const uploadMediaBtn = document.getElementById('uploadMediaBtn');
    const uploadMediaModal = document.getElementById('uploadMediaModal');
    const uploadMediaForm = document.getElementById('uploadMediaForm');
    const mediaProject = document.getElementById('mediaProject');
    const mediaFiles = document.getElementById('mediaFiles');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const filePreview = document.getElementById('filePreview');
    const cancelUpload = document.getElementById('cancelUpload');
    const imageViewerModal = document.getElementById('imageViewerModal');
    const viewerImage = document.getElementById('viewerImage');
    const projectsGallery = document.querySelector('.projects-gallery');

    // Initialize
    init();

    async function init() {
        await loadProjects();
        await loadMediaStats();
        await loadAllMedia();
        setupEventListeners();
    }

    // Load projects for dropdown and gallery
    async function loadProjects() {
        try {
            projects = await api.get('/projects');
            populateProjectDropdowns();
        } catch (error) {
            console.error('Error loading projects:', error);
            showToast('ไม่สามารถโหลดข้อมูลโครงการได้', 'error');
        }
    }

    function populateProjectDropdowns() {
        // Clear existing options (keep first "all" option)
        filterProject.innerHTML = '<option value="all">โครงการทั้งหมด</option>';
        mediaProject.innerHTML = '<option value="">เลือกโครงการ</option>';

        projects.forEach(project => {
            const name = project.projectName || `โครงการ ${project._id}`;
            
            filterProject.innerHTML += `<option value="${project._id}">${name}</option>`;
            mediaProject.innerHTML += `<option value="${project._id}">${name}</option>`;
        });
    }

    // Load media statistics
    async function loadMediaStats() {
        try {
            const stats = await api.get('/media/stats');
            
            // Update stat cards
            document.querySelectorAll('.stat-card')[0].querySelector('h3').textContent = stats.totalMedia || 0;
            document.querySelectorAll('.stat-card')[1].querySelector('h3').textContent = stats.projectsWithMedia || 0;
            
            // Format size
            const sizeInMB = ((stats.totalSize || 0) / (1024 * 1024)).toFixed(2);
            document.querySelectorAll('.stat-card')[2].querySelector('h3').textContent = `${sizeInMB} MB`;
        } catch (error) {
            console.error('Error loading media stats:', error);
        }
    }

    // Load all media grouped by project
    async function loadAllMedia() {
        try {
            projectsGallery.innerHTML = '<p class="loading">กำลังโหลด...</p>';
            
            const filters = {
                projectId: filterProject.value !== 'all' ? filterProject.value : undefined,
                stage: filterMediaType.value !== 'all' ? filterMediaType.value : undefined
            };

            const media = await api.get('/media', filters);
            
            // Group media by project
            mediaByProject = {};
            media.forEach(item => {
                const projectId = item.projectId?._id || item.projectId;
                if (!mediaByProject[projectId]) {
                    mediaByProject[projectId] = {
                        project: item.projectId,
                        before: [],
                        during: [],
                        after: []
                    };
                }
                mediaByProject[projectId][item.stage].push(item);
            });

            renderGallery();
        } catch (error) {
            console.error('Error loading media:', error);
            projectsGallery.innerHTML = '<p class="no-data">ไม่สามารถโหลดข้อมูลได้</p>';
        }
    }

    function renderGallery() {
        if (Object.keys(mediaByProject).length === 0) {
            projectsGallery.innerHTML = '<p class="no-data">ยังไม่มีรูปภาพ กดปุ่ม "อัปโหลดรูปภาพ" เพื่อเพิ่ม</p>';
            return;
        }

        projectsGallery.innerHTML = '';

        Object.entries(mediaByProject).forEach(([projectId, data]) => {
            const projectName = data.project?.projectName || `โครงการ ${projectId}`;
            const totalImages = data.before.length + data.during.length + data.after.length;

            const card = document.createElement('div');
            card.className = 'project-gallery-card';
            card.innerHTML = `
                <div class="project-gallery-header">
                    <h3>${projectName}</h3>
                    <span class="image-count">${totalImages} รูป</span>
                </div>
                
                <div class="media-tabs">
                    <button class="tab-btn active" data-tab="before-${projectId}">ก่อนติดตั้ง (${data.before.length})</button>
                    <button class="tab-btn" data-tab="during-${projectId}">ระหว่างติดตั้ง (${data.during.length})</button>
                    <button class="tab-btn" data-tab="after-${projectId}">หลังติดตั้ง (${data.after.length})</button>
                </div>
                
                <div class="media-grid" id="before-${projectId}" data-project="${projectId}" data-stage="before">
                    ${renderMediaItems(data.before)}
                    ${renderUploadPlaceholder(projectId, 'before')}
                </div>
                <div class="media-grid hidden" id="during-${projectId}" data-project="${projectId}" data-stage="during">
                    ${renderMediaItems(data.during)}
                    ${renderUploadPlaceholder(projectId, 'during')}
                </div>
                <div class="media-grid hidden" id="after-${projectId}" data-project="${projectId}" data-stage="after">
                    ${renderMediaItems(data.after)}
                    ${renderUploadPlaceholder(projectId, 'after')}
                </div>
            `;

            projectsGallery.appendChild(card);
        });

        // Setup tab switching
        setupTabListeners();
    }

    function renderMediaItems(items) {
        return items.map((item, index) => `
            <div class="media-item" data-id="${item._id}" data-index="${index}">
                <img src="${item.path}" alt="${item.originalName}" loading="lazy">
                <div class="media-overlay">
                    <button class="btn-icon view-btn" data-id="${item._id}">👁️</button>
                    <button class="btn-icon delete-btn" data-id="${item._id}">🗑️</button>
                </div>
                <p class="media-date">${formatDate(item.createdAt)}</p>
            </div>
        `).join('');
    }

    function renderUploadPlaceholder(projectId, stage) {
        return `
            <div class="media-item upload-placeholder">
                <button class="btn-upload" data-project="${projectId}" data-stage="${stage}">
                    <span>➕</span>
                    <p>เพิ่มรูปภาพ</p>
                </button>
            </div>
        `;
    }

    function setupTabListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                const card = e.target.closest('.project-gallery-card');
                
                // Toggle active tab button
                card.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Toggle visible grid
                card.querySelectorAll('.media-grid').forEach(grid => {
                    grid.classList.add('hidden');
                });
                card.querySelector(`#${tabId}`).classList.remove('hidden');
            });
        });

        // View buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openImageViewer(e.target.closest('.media-item'));
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteMedia(btn.dataset.id);
            });
        });

        // Quick upload placeholders
        document.querySelectorAll('.btn-upload').forEach(btn => {
            btn.addEventListener('click', () => {
                const projectId = btn.dataset.project;
                const stage = btn.dataset.stage;
                openUploadModal(projectId, stage);
            });
        });
    }

    function setupEventListeners() {
        // Filter changes
        filterProject.addEventListener('change', loadAllMedia);
        filterMediaType.addEventListener('change', loadAllMedia);

        // Upload button
        uploadMediaBtn.addEventListener('click', () => openUploadModal());

        // Modal close buttons
        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.closest('.modal').style.display = 'none';
            });
        });

        // Cancel upload
        cancelUpload.addEventListener('click', () => {
            uploadMediaModal.style.display = 'none';
            resetUploadForm();
        });

        // File upload area click
        fileUploadArea.addEventListener('click', () => mediaFiles.click());

        // File input change
        mediaFiles.addEventListener('change', handleFileSelect);

        // Drag and drop
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('dragover');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('dragover');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('dragover');
            mediaFiles.files = e.dataTransfer.files;
            handleFileSelect();
        });

        // Upload form submit
        uploadMediaForm.addEventListener('submit', handleUpload);

        // Image viewer navigation
        document.querySelector('.nav-btn.prev')?.addEventListener('click', () => navigateViewer(-1));
        document.querySelector('.nav-btn.next')?.addEventListener('click', () => navigateViewer(1));

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Keyboard navigation in viewer
        document.addEventListener('keydown', (e) => {
            if (imageViewerModal.style.display === 'block') {
                if (e.key === 'ArrowLeft') navigateViewer(-1);
                if (e.key === 'ArrowRight') navigateViewer(1);
                if (e.key === 'Escape') imageViewerModal.style.display = 'none';
            }
        });
    }

    function openUploadModal(projectId = '', stage = '') {
        uploadMediaModal.style.display = 'block';
        if (projectId) {
            mediaProject.value = projectId;
        }
        if (stage) {
            document.getElementById('mediaCategory').value = stage;
        }
    }

    function handleFileSelect() {
        const files = mediaFiles.files;
        filePreview.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.createElement('div');
                preview.className = 'preview-item';
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}">
                    <button type="button" class="remove-preview" data-index="${index}">×</button>
                    <p>${file.name}</p>
                `;
                filePreview.appendChild(preview);
                
                // Remove preview handler
                preview.querySelector('.remove-preview').addEventListener('click', (e) => {
                    e.stopPropagation();
                    preview.remove();
                });
            };
            reader.readAsDataURL(file);
        });
    }

    async function handleUpload(e) {
        e.preventDefault();

        const projectId = mediaProject.value;
        const stage = document.getElementById('mediaCategory').value;
        const description = document.getElementById('mediaDescription').value;

        if (!projectId || !stage || mediaFiles.files.length === 0) {
            showToast('กรุณากรอกข้อมูลให้ครบถ้วนและเลือกรูปภาพ', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('projectId', projectId);
        formData.append('stage', stage);
        formData.append('description', description);

        Array.from(mediaFiles.files).forEach(file => {
            formData.append('images', file);
        });

        try {
            const response = await fetch('/api/media/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                showToast(result.message || 'อัปโหลดสำเร็จ', 'success');
                uploadMediaModal.style.display = 'none';
                resetUploadForm();
                await loadMediaStats();
                await loadAllMedia();
            } else {
                throw new Error(result.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('เกิดข้อผิดพลาดในการอัปโหลด: ' + error.message, 'error');
        }
    }

    function resetUploadForm() {
        uploadMediaForm.reset();
        filePreview.innerHTML = '';
    }

    async function deleteMedia(id) {
        if (!confirm('ต้องการลบรูปภาพนี้หรือไม่?')) return;

        try {
            await api.delete(`/media/${id}`);
            showToast('ลบรูปภาพสำเร็จ', 'success');
            await loadMediaStats();
            await loadAllMedia();
        } catch (error) {
            console.error('Delete error:', error);
            showToast('เกิดข้อผิดพลาดในการลบ', 'error');
        }
    }

    function openImageViewer(mediaItem) {
        const mediaGrid = mediaItem.closest('.media-grid');
        currentImages = Array.from(mediaGrid.querySelectorAll('.media-item:not(.upload-placeholder) img'));
        currentImageIndex = Array.from(mediaGrid.querySelectorAll('.media-item:not(.upload-placeholder)')).indexOf(mediaItem);

        if (currentImages.length > 0 && currentImageIndex >= 0) {
            viewerImage.src = currentImages[currentImageIndex].src;
            imageViewerModal.style.display = 'block';
        }
    }

    function navigateViewer(direction) {
        currentImageIndex += direction;
        if (currentImageIndex < 0) currentImageIndex = currentImages.length - 1;
        if (currentImageIndex >= currentImages.length) currentImageIndex = 0;
        
        viewerImage.src = currentImages[currentImageIndex].src;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('th-TH', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    }

    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
