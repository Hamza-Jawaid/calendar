function calendarApp() {
    return {
        isGenerating: false,
        sidebarOpen: false,
        isAgencyOpen: false,
        isClientOpen: false,
        agency: {
            name: 'Captain Design Agency',
            email: 'support@captaindesignagency.com',
            website: 'captaindesignagency.com',
            phone: '(916) 249-7914',
            logo: null
        },
        client: {
            name: 'Add Client Name',
            subtitle: 'Social Media Content Calendar',
        },
        posts: [
            { image: null, headline: '', caption: '', hashtags: '' }
        ],

        checkNewPostNeeded(index) {
            if (index === this.posts.length - 1) {
                const post = this.posts[index];
                if (post.image) {
                    this.addPost();
                }
            }
        },
        addPost() {
            this.posts.push({ image: null, headline: '', caption: '', hashtags: '' });
        },
        removePost(index) {
            this.posts.splice(index, 1);
            if (this.posts.length === 0) {
                this.addPost();
            }
        },

        getDisplayUrl(url) {
            if (!url) return '';
            let domain = url.replace(/(^\w+:|^)\/\//, '').replace(/^www\./, '');
            domain = domain.split('/')[0];
            return 'www.' + domain;
        },

        uploadAgencyLogo(event) {
            const file = event.target.files[0];
            if (file) this.processFile(file, 'logo');
        },
        uploadPostImage(event, index) {
            const file = event.target.files[0];
            if (file) this.processFile(file, 'post', index);
        },
        handleDrop(event, type, index = null) {
            const file = event.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.processFile(file, type, index);
            }
        },
        processFile(file, type, index = null) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (type === 'logo') {
                    this.agency.logo = e.target.result;
                } else if (type === 'post') {
                    this.posts[index].image = e.target.result;
                    this.checkNewPostNeeded(index);
                }
            };
            reader.readAsDataURL(file);
        },

        resizeTextarea(el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
        },

        async generatePDF() {
            this.isGenerating = true;

            try {
                if (typeof PDFGenerator !== 'undefined') {
                    const generator = new PDFGenerator({
                        agency: JSON.parse(JSON.stringify(this.agency)), // Clone to avoid proxies issues if any
                        client: JSON.parse(JSON.stringify(this.client)),
                        posts: JSON.parse(JSON.stringify(this.posts))
                    });
                    await generator.generate();
                } else {
                    console.error("PDFGenerator module not found");
                    alert("Error: PDF Generation module not loaded.");
                }
            } catch (error) {
                console.error("Error generating PDF:", error);
                alert("An error occurred while generating the PDF. Please try again.");
            } finally {
                this.isGenerating = false;
            }
        }
    }
}
