 /* --- 1. AMBIENT BACKGROUND GRID --- */
        const bgCanvas = document.getElementById('wireframe-grid');
        const bgCtx = bgCanvas.getContext('2d');

        function resizeBg() {
            bgCanvas.width = window.innerWidth;
            bgCanvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeBg);
        resizeBg();

        let bgOffset = 0;
        function drawBgGrid() {
            bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
            bgCtx.lineWidth = 1;
            bgOffset = (bgOffset + 0.3) % 40; 

            for (let y = bgOffset; y < bgCanvas.height; y += 40) {
                let opacity = Math.min(y / (bgCanvas.height * 0.4), 0.5);
                bgCtx.strokeStyle = `rgba(56, 60, 65, ${opacity})`;
                bgCtx.beginPath();
                bgCtx.moveTo(0, y);
                bgCtx.lineTo(bgCanvas.width, y);
                bgCtx.stroke();
            }

            bgCtx.strokeStyle = 'rgba(56, 60, 65, 0.3)';
            for (let x = 0; x < bgCanvas.width; x += 40) {
                bgCtx.beginPath();
                bgCtx.moveTo(x, 0);
                bgCtx.lineTo(x, bgCanvas.height);
                bgCtx.stroke();
            }
            requestAnimationFrame(drawBgGrid);
        }
        drawBgGrid();

        /* --- 2. CONTROLLED ISOMETRIC CUBE (CAD MODEL) --- */
        const modelCanvas = document.getElementById('structural-model');
        const modelCtx = modelCanvas.getContext('2d');
        const coordsDisplay = document.getElementById('coords-display');
        
        modelCanvas.width = 500;
        modelCanvas.height = 500;

        // Define a simple, structural 3D cube
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        const edges = [
            [0,1], [1,2], [2,3], [3,0], // back
            [4,5], [5,6], [6,7], [7,4], // front
            [0,4], [1,5], [2,6], [3,7]  // connecting
        ];

        let angleX = Math.PI / 4; // Start isometric
        let angleY = Math.PI / 4;

        function drawModel() {
            modelCtx.clearRect(0, 0, modelCanvas.width, modelCanvas.height);
            
            // Very slow, controlled rotation
            angleY += 0.005;
            angleX = Math.sin(angleY * 0.5) * 0.2 + (Math.PI / 6); // Slight wobble on X

            // Update Coordinates text
            coordsDisplay.innerText = `X: ${(angleX).toFixed(2)} Y: ${(angleY % (Math.PI*2)).toFixed(2)} Z: 1.00`;

            const centerX = modelCanvas.width / 2;
            const centerY = modelCanvas.height / 2;
            const size = 120; // Size of the cube

            let projected = [];

            // Project 3D vertices to 2D
            for (let v of vertices) {
                // Rotate Y
                let x1 = v[0] * Math.cos(angleY) - v[2] * Math.sin(angleY);
                let z1 = v[2] * Math.cos(angleY) + v[0] * Math.sin(angleY);
                
                // Rotate X
                let y1 = v[1] * Math.cos(angleX) - z1 * Math.sin(angleX);
                let z2 = z1 * Math.cos(angleX) + v[1] * Math.sin(angleX);

                // Simple Orthographic projection
                projected.push([x1 * size + centerX, y1 * size + centerY]);
            }

            // Draw Edges
            modelCtx.lineWidth = 1;
            modelCtx.strokeStyle = 'rgba(234, 236, 239, 0.6)'; // Titanium

            for (let edge of edges) {
                modelCtx.beginPath();
                modelCtx.moveTo(projected[edge[0]][0], projected[edge[0]][1]);
                modelCtx.lineTo(projected[edge[1]][0], projected[edge[1]][1]);
                modelCtx.stroke();
            }

            // Draw subtle points at intersections
            modelCtx.fillStyle = '#FFFFFF';
            for (let p of projected) {
                modelCtx.beginPath();
                modelCtx.arc(p[0], p[1], 2, 0, Math.PI * 2);
                modelCtx.fill();
            }

            requestAnimationFrame(drawModel);
        }
        drawModel();






        /* --- 3. MOBILE SYSTEM HUD LOGIC --- */
        const menuTrigger = document.getElementById('menu-trigger');
        const mobileHud = document.getElementById('mobile-hud');
        const hudLinks = document.querySelectorAll('.hud-link');

        // Toggle HUD on click
        menuTrigger.addEventListener('click', () => {
            mobileHud.classList.toggle('active');
            if (mobileHud.classList.contains('active')) {
                menuTrigger.innerText = '[ CLOSE ]';
                menuTrigger.style.borderColor = 'var(--sensor-red)';
                menuTrigger.style.color = 'var(--sensor-red)';
            } else {
                menuTrigger.innerText = '[ MENU ]';
                menuTrigger.style.borderColor = 'var(--steel-ash)';
                menuTrigger.style.color = 'var(--chrome)';
            }
        });

        // Close HUD when a link is clicked
        hudLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileHud.classList.remove('active');
                menuTrigger.innerText = '[ MENU ]';
                menuTrigger.style.borderColor = 'var(--steel-ash)';
                menuTrigger.style.color = 'var(--chrome)';
            });
        });





        /* --- 4. THREE.JS HOLOGRAPHIC NEURAL MESH --- */
        const container = document.getElementById('three-canvas');
        
        // Setup Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create the Neural Mesh (A highly detailed Icosahedron rendered as points)
        const geometry = new THREE.IcosahedronGeometry(10, 3); // Complex sphere shape
        
        // Material for the points (Holographic Titanium look)
        const material = new THREE.PointsMaterial({
            color: 0xEAECEF,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });

        const sphere = new THREE.Points(geometry, material);
        scene.add(sphere);

        // Add an inner glowing wireframe for depth
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0x383C41,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        const innerSphere = new THREE.Mesh(geometry, wireMaterial);
        innerSphere.scale.set(0.98, 0.98, 0.98);
        scene.add(innerSphere);

        camera.position.z = 25;

        // Mouse Tracking Interaction
        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - window.innerWidth / 2);
            mouseY = (event.clientY - window.innerHeight / 2);
        });

        // Animation Loop
        function animateThree() {
            requestAnimationFrame(animateThree);

            // Autonomous slow rotation
            sphere.rotation.y += 0.002;
            sphere.rotation.x += 0.001;
            innerSphere.rotation.y += 0.001;

            // Mouse interaction (smooth follow)
            targetX = mouseX * 0.001;
            targetY = mouseY * 0.001;
            
            sphere.rotation.y += 0.05 * (targetX - sphere.rotation.y);
            sphere.rotation.x += 0.05 * (targetY - sphere.rotation.x);

            renderer.render(scene, camera);
        }
        animateThree();

        // Handle Window Resize for the 3D Canvas
        window.addEventListener('resize', () => {
            if(container) {
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        });

        // Hover effect linkage (Flash red when hovering a project)
        const projects = document.querySelectorAll('.project-item');
        projects.forEach(proj => {
            proj.addEventListener('mouseenter', () => {
                material.color.setHex(0xD72638); // Sensor Red
                material.size = 0.08;
            });
            proj.addEventListener('mouseleave', () => {
                material.color.setHex(0xEAECEF); // Back to Titanium
                material.size = 0.05;
            });
        });


        // Simulate Live Telemetry Data
        setInterval(() => {
            // Fluctuate latency between 11ms and 14ms
            const latency = Math.floor(Math.random() * (14 - 11 + 1)) + 11;
            document.getElementById('live-latency').innerText = latency;

            // Slowly tick up the Petabytes Processed
            let dataElem = document.getElementById('live-data');
            let currentData = parseFloat(dataElem.innerText);
            let newData = (currentData + 0.01).toFixed(2);
            dataElem.innerText = newData;
        }, 2000); // Updates every 2 seconds


        setInterval(() => {
            const lat = Math.floor(Math.random() * 4) + 10;
            document.getElementById('tick-latency').innerText = lat;
            
            let data = document.getElementById('tick-data');
            data.innerText = (parseFloat(data.innerText) + 0.01).toFixed(2);
        }, 1500);

        const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    document.getElementById('wireframe-grid').style.transform = `translateY(${scrolled * 0.2}px)`;
});