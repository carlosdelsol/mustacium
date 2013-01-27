	$(function() {
    	$( "#sliderLong" ).slider({
            range: "min",
            value: 50,
            min: 10,
            max: 100,
            slide: function( event, ui ) {
                $( "#longVal" ).text( ui.value + "%");
            },
            stop: function( event, ui ) {
            	var i=0, j=0;
          		long_pelo(ui.value);
            }

        });
        $( "#longVal" ).text( $( "#sliderLong" ).slider( "value" ) + "%" );

        $('#sliderLong-handle').live('mouseup', function() {
		  var value = $(this).closest('#sliderLong').slider('value');
		  
		});


        $( "#sliderRizo" ).slider({
            range: "min",
            value: 30,
            min: 20,
            max: 100,
            slide: function( event, ui ) {
                $( "#rizoVal" ).text( ui.value + "%");
            },
				stop: function( event, ui ) {
            	var i=0, j=0;
          		rizo_pelo(ui.value);
            }
            
        });
        $( "#rizoVal" ).text( $( "#sliderRizo" ).slider( "value" ) + "%" );
        
        $( "#sliderDens" ).slider({
            range: "min",
            value: 2000,
            min: 500,
            max: 2000,
            slide: function( event, ui ) {
                $( "#densVal" ).text( ui.value + " pelos" );
                	var i=0;
					for(i=0; i<ui.value;i++){
						scene.children[i].visible = true;
					}
					for(i=0; i<num_pelos-ui.value;i++){
						scene.children[i].visible = false;
					}
					
            }
        });
        $( "#densVal" ).text( $( "#sliderDens" ).slider( "value" ) + " pelos" );
		
		$("#colorPelo").change(function() {
		  color_pelo();
		});

		if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
		

		var mouse = { x: 0, y: 0 }, INTERSECTED;
		var geometry = [];
		var points = [];
		var num_pelos =  2000,
		windowHalfX = window.innerWidth / 2,
		windowHalfY = window.innerHeight / 2,

		camera, scene, renderer, projector, material;

		init();
		animate();

	function clear_scene(){
		for (var j = 0; j < scene.children.length; j ++ ) {
			scene.children[j].material = material;
		}
	}

	function color_pelo(){
		var hex = parseInt(document.getElementById('colorPelo').value.substring(1), 16); 
		var material = new THREE.LineBasicMaterial({
		    color: hex,
		});
		for (var j = 0; j < scene.children.length; j ++ ) {
			scene.children[j].material = material;
		}
	}

	function long_pelo(porcent){
		for (var j = 0; j < scene.children.length; j ++ ) {
			scene.children[j].scale.y = porcent/100;
		}
	}

	function rizo_pelo(porcent){
		for (var j = 0; j < scene.children.length; j ++ ) {
			scene.children[j].scale.x = porcent/100;
			scene.children[j].scale.z = porcent/100;
		}
	}


	function init() {

		var i, j, n_sub, container;

		container = document.getElementById( 'container' );
		camera = new THREE.PerspectiveCamera( 33, window.innerWidth / window.innerHeight, 1, 10000 );
		camera.position.z = 700;

		scene = new THREE.Scene();

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setSize(document.getElementById("container").offsetWidth, document.getElementById("container").offsetHeight);
		container.appendChild( renderer.domElement );

		for ( i = 0; i < num_pelos; i ++ ) { geometry[i] = new THREE.Geometry(); }
		for ( i = 0; i < num_pelos; i ++ ) { points[i] = puntos_pelo( new THREE.Vector3( 0,0,0 ), 50.0, 1 ); }
		var colors = [];

		n_sub = 6;

		var position, index;
		var spline = [];
		for ( j = 0; j < num_pelos; j ++ ) {
			spline[j] = new THREE.Spline( points[j] );

			for ( i = 0; i < points[j].length * n_sub; i ++ ) {

				index = i / ( points[j].length * n_sub );
				position = spline[j].getPoint( index );

				geometry[j].vertices[ i ] = new THREE.Vector3( position.x, position.y, position.z );

				colors[ i ] = new THREE.Color( 0x000000 );
			}

			geometry[j].colors = colors;
		}

		material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 1, linewidth: 3, vertexColors: THREE.VertexColors } );

		var line, p, scale = 0.3, x, y ;

		var parameters =  [];
		var contx = 0;
		var conty = 0;
		for ( i = 0; i < num_pelos; i ++ ) {
			if(contx>num_pelos/15){
				contx=0;
				conty = conty + 5;
			}	
			
			x = (contx*3)-100+Math.floor((Math.random()*10)+1);
			y = conty + Math.floor((Math.random()*3));
			
			parameters[i] = [ material, scale*1.5, [x,y,0],  geometry[i] ];
			contx++;
		}

		for ( i = 0; i < parameters.length; ++ i ) {

			p = parameters[ i ];
			line = new THREE.Line( p[ 3 ],  p[ 0 ] );
			line.scale.x = line.scale.y = line.scale.z =  p[ 1 ];
			line.position.x = p[ 2 ][ 0 ];
			line.position.y = p[ 2 ][ 1 ];
			line.position.z = p[ 2 ][ 2 ];
			scene.add( line );
		}

		projector = new THREE.Projector();

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', onDocumentTouchMove, false );

		window.addEventListener( 'resize', onWindowResize, false );
	}

	function onWindowResize() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( window.innerWidth, window.innerHeight );
	}

	function puntos_pelo( center, side, iterations) {
		var half = side/2;
		//creamos la orientación hacia izquierda y derecha de cada tramo del pelo
		//un pelo liso las tendrá las dos primeras y las dos ultimas con el mismo valor
		var centerx = center.x - half - 220;
		var center_pos = []; 
		var ran_number = [];
		for (i=0;i<4;i++){
			ran_number[i] = Math.ceil(Math.random() * 100);

			if (ran_number[i] <= 50) {
				center_pos[i] = centerx - Math.floor((Math.random()*10)+1);
			} else {
				center_pos[i] = centerx + Math.floor((Math.random()*10)+1);
			}
		}
			vec_s = [
			new THREE.Vector3( center_pos[0], center.y + side, center.z ),
			new THREE.Vector3( center_pos[1], center.y + half, center.z + half ),
			new THREE.Vector3( center_pos[2], center.y - half, center.z + half ),
			new THREE.Vector3( center_pos[3], center.y - side, center.z ),
			],
			vec = [ vec_s[ 0 ], vec_s[ 1 ], vec_s[ 2 ], vec_s[ 3 ]];
		return vec;
	}

	function onDocumentMouseMove( event ) {
		mouse.x = event.clientX - windowHalfX;
		mouse.y = event.clientY - windowHalfY;
	}

	function onDocumentTouchStart( event ) {
		if ( event.touches.length > 1 ) {
			event.preventDefault();
			mouse.x = event.touches[ 0 ].pageX - windowHalfX;
			mouse.y = event.touches[ 0 ].pageY - windowHalfY;
		}
	}

	function onDocumentTouchMove( event ) {
		if ( event.touches.length == 1 ) {
			event.preventDefault();
			mouse.x = event.touches[ 0 ].pageX - windowHalfX;
			mouse.y = event.touches[ 0 ].pageY - windowHalfY;
		}
	}

	function animate() {
		requestAnimationFrame( animate );
		render();
	}

	function render() {
		camera.position.x += ( mouse.x - camera.position.x ) * .05;
		camera.position.y += ( - mouse.y + 200 - camera.position.y ) * .05;
		camera.lookAt( scene.position );
/*
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

		var intersects = ray.intersectObjects( scene.children );

		if ( intersects.length > 0 ) {

			if ( INTERSECTED != intersects[ 0 ].object ) {

				if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

				INTERSECTED = intersects[ 0 ].object;
				INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
				INTERSECTED.material.emissive.setHex( 0xff0000 );

			}

		} else {

			if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

			INTERSECTED = null;

		}

*/
		renderer.render( scene, camera );
	}

});