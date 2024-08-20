import React, { useState, useEffect, useCallback } from 'react';
import { View, Dimensions, TouchableWithoutFeedback, StyleSheet, Image } from 'react-native';
import { Canvas, Circle, useCanvasRef } from '@shopify/react-native-skia';

const SkiaComponent = () => {
  const canvasRef = useCanvasRef();
  
  const radius = 25; // Radius of the circles
  const imageSize = 70; // Size of the Bitcoin symbol image
  const gridSpacing = radius * 3 + 10; // Spacing between circles
  const { width, height } = Dimensions.get('window');

  const generateCircles = useCallback(() => {
    const circlesArray = [];
    const columns = Math.floor(width / gridSpacing);
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < columns; col++) {
        const x = col * gridSpacing + radius;
        const y = row * gridSpacing + radius;

        if (x + radius <= width && y + radius <= height) {
          circlesArray.push({
            id: circlesArray.length + 1,
            x,
            y,
            velocityX: (Math.random() * 4) - 2, // Random X velocity
            velocityY: (Math.random() * 4) - 2, // Random Y velocity
            rotation: Math.random() * 360, // Random initial rotation
          });
        }
      }
    }

    return circlesArray;
  }, [width, height]);

  const [circles, setCircles] = useState(() => generateCircles());

  useEffect(() => {
    setCircles(generateCircles());
  }, [width, height, generateCircles]);

  const checkCollision = useCallback((circle1, circle2) => {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= imageSize;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCircles((prevCircles) => {
        const newCircles = prevCircles.map((circle) => {
          let newX = circle.x + circle.velocityX;
          let newY = circle.y + circle.velocityY;
          let newRotation = (circle.rotation + 2) % 360;

          // Check for collision with the edges and reverse direction if needed
          if (newX - imageSize / 2 < 0 || newX + imageSize / 2 > width) {
            circle.velocityX = -circle.velocityX;
            newX = Math.max(imageSize / 2, Math.min(width - imageSize / 2, newX));
          }

          if (newY - imageSize / 2 < 0 || newY + imageSize / 2 > height) {
            circle.velocityY = -circle.velocityY;
            newY = Math.max(imageSize / 2, Math.min(height - imageSize / 2, newY));
          }

          return { ...circle, x: newX, y: newY, rotation: newRotation };
        });

        // Check for collisions between circles
        for (let i = 0; i < newCircles.length; i++) {
          for (let j = i + 1; j < newCircles.length; j++) {
            if (checkCollision(newCircles[i], newCircles[j])) {
              // Calculate separation vector
              const dx = newCircles[j].x - newCircles[i].x;
              const dy = newCircles[j].y - newCircles[i].y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const overlap = imageSize - distance;

              // Move circles to avoid overlap
              const moveX = (dx / distance) * overlap / 2;
              const moveY = (dy / distance) * overlap / 2;

              newCircles[i].x -= moveX;
              newCircles[i].y -= moveY;
              newCircles[j].x += moveX;
              newCircles[j].y += moveY;

              // Swap velocities to simulate elastic collision
              [newCircles[i].velocityX, newCircles[j].velocityX] = [newCircles[j].velocityX, newCircles[i].velocityX];
              [newCircles[i].velocityY, newCircles[j].velocityY] = [newCircles[j].velocityY, newCircles[i].velocityY];
            }
          }
        }

        return newCircles;
      });
    }, 16); // Approximately 60 FPS

    return () => clearInterval(interval);
  }, [width, height, checkCollision]);

  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <Canvas style={styles.canvas} ref={canvasRef}>
          {circles.map((circle) => (
            <Circle
              key={`circle-${circle.id}`}
              cx={circle.x}
              cy={circle.y}
              r={radius}
              color=""
            />
          ))}
        </Canvas>
        {circles.map((circle) => (
          <Image
            key={`img-${circle.id}`}
            source={require('./bitcoin.png')}
            style={[
              styles.image,
              {
                left: circle.x - imageSize / 2,
                top: circle.y - imageSize / 2,
                width: imageSize,
                height: imageSize,
                transform: [{ rotate: `${circle.rotation}deg` }],
              }
            ]}
          />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  canvas: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  image: {
    position: 'absolute',
  },
});

export default SkiaComponent;