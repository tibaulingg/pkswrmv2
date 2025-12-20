import { useEffect, useRef, useState } from 'react';
import GameEngine from '../game/Core/GameEngine.js';

export default function Game() {
	const canvasRef = useRef(null);
	const containerRef = useRef(null);
	const engineRef = useRef(null);
	const [scale, setScale] = useState(1);

	useEffect(() => {
		if (canvasRef.current && !engineRef.current) {
			engineRef.current = new GameEngine(canvasRef.current);
			engineRef.current.start();
		}

		return () => {
			if (engineRef.current) {
				engineRef.current = null;
			}
		};
	}, []);

	useEffect(() => {
		const updateScale = () => {
			const windowWidth = window.innerWidth;
			const windowHeight = window.innerHeight;
			const gameWidth = 1280;
			const gameHeight = 720;

			const scaleX = windowWidth / gameWidth;
			const scaleY = windowHeight / gameHeight;
			const newScale = Math.min(scaleX, scaleY, 1);

			setScale(newScale);
		};

		updateScale();
		window.addEventListener('resize', updateScale);

		return () => {
			window.removeEventListener('resize', updateScale);
		};
	}, []);

	return (
		<div ref={containerRef} style={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			width: '100%',
			height: '100%'
		}}>
			<canvas 
				ref={canvasRef} 
				width="1280" 
				height="720"
				style={{
					backgroundColor: '#111',
					boxShadow: '0 0 20px rgba(0,0,0,0.5)',
					transform: `scale(${scale})`,
					transformOrigin: 'center center',
					imageRendering: 'pixelated'
				}}
			/>
		</div>
	);
}

