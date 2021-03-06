/*global define*/

define( [
    'jquery',
    'underscore',
    'backbone',
    'templates'
], function ( $, _, Backbone, JST ) {
    'use strict';

    var EmployeeDetailsView = Backbone.View.extend( {

	template    : JST[ 'app/scripts/templates/employee-details.ejs' ],
	className   : 'employee-details',
	errorFields : [ ],
	events      : {
	    'submit form#edit-form'  : 'updateEmployee',
	    'click .delete-employee' : 'deleteEmployee'
        },

        initialize: function ( ) {

            var self = this;

            self.listenTo( self.model, 'remove', function ( index ) {
                var options = options || {};
                options.url = self.model.url( );

                options.success = function ( ) {
                    window.App.router.navigate( '/employees', true );
                    return self.remove( );
                };
                options.error = function ( ) {

                };

                self.model.collection.sync( 'delete', self.model, options );
            } );

        },

        updateEmployee: function ( e ) {
            e.preventDefault( );

            var self = this;
            var form = e.currentTarget;
            var data = {};

	    data.first_name    = self.fieldValidation( form.first_name, /^[a-zA-Z\s]{1,30}$/ );
	    data.middle_name   = self.fieldValidation( form.middle_name, /^[a-zA-Z\s]{1,30}$/ );
	    data.last_name     = self.fieldValidation( form.last_name, /^[a-zA-Z\s]{1,30}$/ );
	    data.address       = self.fieldValidation( form.address, /^.{2,60}$/ );
	    data.email         = self.fieldValidation( form.email, /^[a-z]+\.[a-z]+@globalzeal\.net$/ );
	    data.gender        = self.fieldValidation( form.gender, /^(male|female)$/ );
            data.date_of_birth = self.fieldValidation( form.date_of_birth, /^\d{2}\/\d{2}\/\d{4}$/ );
            data.date_employed = self.fieldValidation( form.date_employed, /^\d{2}\/\d{2}\/\d{4}$/ );
	    data.user_role     = self.fieldValidation( form.user_role, /^(admin|custodian|employee)$/ );

            if ( self.errorFields.length === 0 ) {

                $( 'input, button, option, textarea' ).prop( 'disabled', true );
                $( '.btns' ).addClass( 'loading' );

                self.model.save( data, {
                    wait: true,
                    success: function ( model, xhr, options ) {
                        if ( JSON.stringify( xhr ) && JSON.stringify( xhr ).match( /email/ ) ) {
                            $( 'input, button, option' ).prop( 'disabled', false );
                            $( '.btns' ).removeClass( 'error loading' );
                            $( form[ 'email' ] ).parent( ).addClass( 'has-error error' );
                            model.set( model.previousAttributes( ), {
                                silent: true
                            } ); // if error, reset modal value
                        } else {
                            $( '#edit-modal' ).modal( 'hide' );
                            $( 'input, button, option, textarea' ).prop( 'disabled', false );
                            $( '.btns' ).removeClass( 'loading' );
                            self.render( );
                        }
                    },
                    error: function ( model, xhr, options ) {
                        if ( JSON.stringify( xhr ) && JSON.stringify( xhr ).match( /email/ ) ) {
                            $( 'input, button, option' ).prop( 'disabled', false );
                            $( '.btns' ).removeClass( 'error loading' );
                            $( form[ 'email' ] ).parent( ).addClass( 'has-error error' );
                            model.set( model.previousAttributes( ), {
                                silent: true
                            } ); // if error, reset modal value
                        }
                    }
                } );

            } else {
                self.errorFields = [ ];
            }

        },

        fieldValidation: function ( field, regexp ) {

            $( field ).removeClass( 'error' );

            if ( field.value.match( regexp ) !== null ) {
                $( field ).parent( ).removeClass( 'has-error' );
                return field.value;
            } else {
                this.errorFields.pop( field.id );
                this.errorFields.push( field.id );
                return $( field ).parent( ).addClass( 'has-error' );
            }

        },

        deleteEmployee: function ( ) {

            var self = this;
            var bootbox = window.bootbox;

            bootbox.dialog( {
		message : 'Are you sure you want to delete ' + self.model.get( 'first_name' ) + ' ' + self.model.get( 'last_name' ) + ' ?',
		title   : "Confirm Deletion",
		buttons : {
                    default: {
			label     : " Cancel ",
			className : "btn-default",
			callback  : function ( ) {}
                    },
                    danger: {
			label     : " Yes ",
			className : "btn-danger",
			callback  : function ( ) {
                            self.model.collection.remove( self.model );
                        }
                    }
                }
            } );

        },

        render: function ( ) {

            var self = this;

            self.$el.html( self.template( {
                model: self.model
            } ) );

            return self;
        }

    } );

    return EmployeeDetailsView;
} );
