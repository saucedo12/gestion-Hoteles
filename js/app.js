var listHoteles = [];
var marker = null;

function cambiarPagina(page){
	$.mobile.changePage("#"+page, {
		transition: "flip"
	});
}

function reconstruirTabla(){
	var ulHotels = $("#ulHotels");
	$(".lihotel").remove();

	if (listHoteles.length == 0) {
		var li = $("<li>").addClass("lihotel");
		li.text("No hay hoteles registrados.");
		ulHotels.append(li);
	}
	
	$(listHoteles).each(function(i,e){
		var li = $("<li>").addClass("lihotel");
		var a = $("<a>").text(e.nombre).data("hotel", e).click(function(){
			verHotel($(this).data("hotel"));
		});
		li.append(a);
		ulHotels.append(li);
	});
	
	if (ulHotels.hasClass('ui-listview')) {
    	ulHotels.listview('refresh');
    } else {
    	ulHotels.trigger('create');
    }	
}


function agregarMarcador(e) {
	if (marker) {
		marker.setMap(null);
		marker = null;
	}	
	
	marker = new google.maps.Marker({
		position: e.latLng,
		map: this,
		draggable: true,
		title: $("#txtNombre").val() == "" ? "Ubicación Hotel" : $("#txtNombre").val()
	});

	//Intento obtener la ciudad
	var txtCiudad = $('#txtCiudad');
	//if (txtCiudad.val() == "") {
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'location': e.latLng}, function(results, status){
			if (status == google.maps.GeocoderStatus.OK && results[2]){
				txtCiudad.val(results[2].formatted_address);
			} else {
				txtCiudad.val("");
			}
		});
	//}
}

$(document).ready(function () {
	if (typeof(Storage) !== "undefined") {
		var lstHoteles = localStorage.lstHoteles;
		if (lstHoteles && lstHoteles.length > 0) {
			listHoteles = $.parseJSON(lstHoteles);
		}
	}

	reconstruirTabla();

	$("#page2").on("pageshow", function (event, ui) {		
		//18.4769326,-69.9449253 Coordenadas del JW Marriot en Santo Domingo
		var LatLng = new google.maps.LatLng(28.3609,-106.06093); 
		var opciones = {            
				zoom: 15,
				center: LatLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP        
		};
		var mapa = new google.maps.Map(document.getElementById("dvMap"), opciones);
		mapa.addListener('click', agregarMarcador);
		$("#txtNombre").focus();
	});
	
	$("#pgHotel").on("pageshow", function (event, ui) {		
		var hotel = $("#dvMap2").data("hotel");
		var LatLng = new google.maps.LatLng(hotel.ubicacion.lat,hotel.ubicacion.long); 
		var opciones = {            
				zoom: 15,
				center: LatLng,
				mapTypeId: google.maps.MapTypeId.ROADMAP        
		};
		var mapa = new google.maps.Map(document.getElementById("dvMap2"), opciones);
			
		var myMarker = new google.maps.Marker({
			position: LatLng,
			map: mapa,
			title: hotel.nombre
		});
		
	});

	$("#btnRegistrar").click(function () {
		limpiarCamposRegistro();	
		
		cambiarPagina("page2");
	});
	
	$("#btnPage3, #btnPage3a").click(function () { cambiarPagina("page3"); });
	$("#btnPage1, #btnPage1b, #btnPage1c").click(function () { cambiarPagina("page1"); });
	$("#btnDelete").click(eliminarHotel);

	$("#btnCrear").click(crearHotel);

});

function verHotel(hotel) {
	$("#lblNombre").text(hotel.nombre);
	$("#lblCiudad").text(hotel.ciudad);
	$("#lblTelefono").text(hotel.telefono);
	$("#lblEstrellas").text(hotel.estrellas);
	$("#dvMap2").data("hotel", hotel);
	$("#btnDelete").data("hotel", hotel);


	cambiarPagina("pgHotel");
}

function eliminarHotel() {
	if (confirm("¿Realmente quieres eliminar el horel de la lista?")) {
		var btnDelete = $(this);
		var hotel = btnDelete.data("hotel");
		var hotelIndex = null;

		for (var i = 0; i < listHoteles.length; i++) {
			if (listHoteles[i].id == hotel.id) {
				hotelIndex = i;
			}
		}

		if (hotelIndex >= 0) listHoteles.splice(hotelIndex, 1);
		for (var i = hotelIndex; i < listHoteles.length; i++) {
			listHoteles[i].id--;
		}

		saveToLocalStorage();
		reconstruirTabla();
		cambiarPagina("page1");
	}
}

function crearHotel() {
	var nombre = $("#txtNombre").val();
	var ubicacion = {lat: null, "long": null};
	if (marker) {
		var ubicacion = {lat: marker.getPosition().lat(), "long": marker.getPosition().lng()};			
	}
	var ciudad = $("#txtCiudad").val();
	var telefono = $("#txtTelefono").val();
	var estrellas = $("#txtEstrellas").val();

	if (nombre == "") {
		alert("Por favor llene este campo.");
		return false;
	}

	if (ciudad == "") {
		alert("Por favor llene este campo.");
		return false;
	}

	var hotel = {
		nombre: nombre,
		ubicacion: ubicacion,
		ciudad: ciudad,
		telefono: telefono,
		estrellas: estrellas,
		id: null
	};

	if (listHoteles === undefined) listHoteles = [];
	hotel.id = listHoteles.length + 1;
	listHoteles.push(hotel);
	saveToLocalStorage();
	
	limpiarCamposRegistro();
    reconstruirTabla();
    alert("Registro exitoso")
    //verHotel(hotel);
}

function saveToLocalStorage(){
	if (typeof(Storage) !== "undefined") {
		//Guardo lista de hoteles
		localStorage.lstHoteles = JSON.stringify(listHoteles);
    }
}



function limpiarCamposRegistro() {
		$("#txtNombre").val("");
		$("#txtCiudad").val("");
		$("#txtTelefono").val("");
		$("#txtEstrellas").val("");
}
