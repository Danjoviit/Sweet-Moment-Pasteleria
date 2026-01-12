from django.core.management.base import BaseCommand
from sweet.models import User, Category, Product, ProductVariant, DeliveryZone, Promotion
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Crea datos de prueba para la aplicación'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('🚀 Iniciando creación de datos de prueba...\n'))

        # Limpiar datos existentes (opcional)
        self.stdout.write('🗑️  Limpiando datos antiguos...')
        ProductVariant.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Promotion.objects.all().delete()
        DeliveryZone.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        
        # ============ USUARIOS ============
        self.stdout.write('\n👥 Creando usuarios...')
        
        # Admin
        admin = User.objects.create_superuser(
            username='admin@momentosdulces.com',
            email='admin@momentosdulces.com',
            password='admin123',
            name='Administrador',
            phone='0987654321',
            role='admin'
        )
        self.stdout.write(self.style.SUCCESS(f'  ✓ Admin: {admin.email} / admin123'))

        # Recepcionista
        recep = User.objects.create_user(
            username='recepcion@momentosdulces.com',
            email='recepcion@momentosdulces.com',
            password='recep123',
            name='María García',
            phone='0998765432',
            role='recepcionista'
        )
        self.stdout.write(self.style.SUCCESS(f'  ✓ Recepcionista: {recep.email} / recep123'))

        # Usuarios normales
        users_data = [
            ('Juan Pérez', 'juan@example.com', '0991234567'),
            ('Ana López', 'ana@example.com', '0992345678'),
            ('Carlos Ruiz', 'carlos@example.com', '0993456789'),
        ]

        usuarios = []
        for name, email, phone in users_data:
            user = User.objects.create_user(
                username=email,
                email=email,
                password='user123',
                name=name,
                phone=phone,
                role='usuario'
            )
            usuarios.append(user)
            self.stdout.write(self.style.SUCCESS(f'  ✓ Usuario: {email} / user123'))

        # ============ CATEGORÍAS ============
        self.stdout.write('\n📁 Creando categorías...')
        
        categorias_data = [
            ('Pasteles', 'Deliciosos pasteles para toda ocasión', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587'),
            ('Cupcakes', 'Cupcakes decorados artesanalmente', 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7'),
            ('Galletas', 'Galletas frescas y crujientes', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35'),
            ('Postres', 'Variedad de postres exquisitos', 'https://images.unsplash.com/photo-1587314168485-3236d6710814'),
            ('Tartas', 'Tartas clásicas y modernas', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187'),
        ]

        categorias = {}
        for nombre, descripcion, imagen in categorias_data:
            cat = Category.objects.create(
                name=nombre,
                description=descripcion,
                image=imagen,
                is_active=True
            )
            categorias[nombre] = cat
            self.stdout.write(self.style.SUCCESS(f'  ✓ {nombre}'))

        # ============ PRODUCTOS ============
        self.stdout.write('\n🎂 Creando productos...')
        
        productos_data = [
            # Pasteles
            {
                'name': 'Pastel de Chocolate',
                'category': 'Pasteles',
                'description': 'Delicioso pastel de chocolate con frosting de ganache',
                'base_price': 25.00,
                'stock': 15,
                'image': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
                'variants': [
                    {'name': 'Personal', 'price': 8.00, 'unit': 'unidad'},
                    {'name': 'Mediano', 'price': 25.00, 'unit': '8 porciones'},
                    {'name': 'Grande', 'price': 45.00, 'unit': '16 porciones'},
                ]
            },
            {
                'name': 'Pastel Red Velvet',
                'category': 'Pasteles',
                'description': 'Suave pastel red velvet con crema de queso',
                'base_price': 30.00,
                'stock': 12,
                'image': 'https://images.unsplash.com/photo-1535254973040-607b474cb50d',
                'variants': [
                    {'name': 'Personal', 'price': 10.00, 'unit': 'unidad'},
                    {'name': 'Mediano', 'price': 30.00, 'unit': '8 porciones'},
                    {'name': 'Grande', 'price': 50.00, 'unit': '16 porciones'},
                ]
            },
            {
                'name': 'Pastel de Tres Leches',
                'category': 'Pasteles',
                'description': 'Clásico pastel de tres leches con merengue',
                'base_price': 22.00,
                'stock': 20,
                'image': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
                'variants': [
                    {'name': 'Personal', 'price': 7.00, 'unit': 'unidad'},
                    {'name': 'Mediano', 'price': 22.00, 'unit': '8 porciones'},
                    {'name': 'Grande', 'price': 40.00, 'unit': '16 porciones'},
                ]
            },
            
            # Cupcakes
            {
                'name': 'Cupcakes de Vainilla',
                'category': 'Cupcakes',
                'description': 'Esponjosos cupcakes de vainilla con buttercream',
                'base_price': 12.00,
                'stock': 50,
                'image': 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7',
                'variants': [
                    {'name': 'Unidad', 'price': 2.50, 'unit': '1 cupcake'},
                    {'name': 'Caja de 6', 'price': 12.00, 'unit': '6 cupcakes'},
                    {'name': 'Caja de 12', 'price': 22.00, 'unit': '12 cupcakes'},
                ]
            },
            {
                'name': 'Cupcakes de Chocolate',
                'category': 'Cupcakes',
                'description': 'Intensos cupcakes de chocolate con chispas',
                'base_price': 12.00,
                'stock': 45,
                'image': 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb',
                'variants': [
                    {'name': 'Unidad', 'price': 2.50, 'unit': '1 cupcake'},
                    {'name': 'Caja de 6', 'price': 12.00, 'unit': '6 cupcakes'},
                    {'name': 'Caja de 12', 'price': 22.00, 'unit': '12 cupcakes'},
                ]
            },
            
            # Galletas
            {
                'name': 'Galletas de Chips de Chocolate',
                'category': 'Galletas',
                'description': 'Crujientes galletas con chips de chocolate belga',
                'base_price': 8.00,
                'stock': 100,
                'image': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35',
                'variants': [
                    {'name': 'Paquete 6', 'price': 5.00, 'unit': '6 galletas'},
                    {'name': 'Paquete 12', 'price': 8.00, 'unit': '12 galletas'},
                    {'name': 'Paquete 24', 'price': 15.00, 'unit': '24 galletas'},
                ]
            },
            {
                'name': 'Galletas de Avena',
                'category': 'Galletas',
                'description': 'Saludables galletas de avena con pasas',
                'base_price': 7.00,
                'stock': 80,
                'image': 'https://images.unsplash.com/photo-1590080876695-23d4e0c5448e',
                'variants': [
                    {'name': 'Paquete 6', 'price': 4.00, 'unit': '6 galletas'},
                    {'name': 'Paquete 12', 'price': 7.00, 'unit': '12 galletas'},
                    {'name': 'Paquete 24', 'price': 13.00, 'unit': '24 galletas'},
                ]
            },
            
            # Postres
            {
                'name': 'Tiramisú',
                'category': 'Postres',
                'description': 'Auténtico tiramisú italiano con café y mascarpone',
                'base_price': 6.00,
                'stock': 25,
                'image': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9',
                'variants': [
                    {'name': 'Personal', 'price': 6.00, 'unit': 'porción'},
                    {'name': 'Familiar', 'price': 20.00, 'unit': '6 porciones'},
                ]
            },
            {
                'name': 'Cheesecake de Fresa',
                'category': 'Postres',
                'description': 'Cremoso cheesecake con salsa de fresas frescas',
                'base_price': 7.00,
                'stock': 20,
                'image': 'https://images.unsplash.com/photo-1533134242116-2fa05617f715',
                'variants': [
                    {'name': 'Personal', 'price': 7.00, 'unit': 'porción'},
                    {'name': 'Familiar', 'price': 25.00, 'unit': '8 porciones'},
                ]
            },
            
            # Tartas
            {
                'name': 'Tarta de Manzana',
                'category': 'Tartas',
                'description': 'Tradicional tarta de manzana con canela',
                'base_price': 18.00,
                'stock': 15,
                'image': 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9',
                'variants': [
                    {'name': 'Personal', 'price': 5.00, 'unit': 'porción'},
                    {'name': 'Entera', 'price': 18.00, 'unit': '8 porciones'},
                ]
            },
            {
                'name': 'Tarta de Limón',
                'category': 'Tartas',
                'description': 'Refrescante tarta de limón con merengue',
                'base_price': 20.00,
                'stock': 12,
                'image': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
                'variants': [
                    {'name': 'Personal', 'price': 6.00, 'unit': 'porción'},
                    {'name': 'Entera', 'price': 20.00, 'unit': '8 porciones'},
                ]
            },
        ]

        for prod_data in productos_data:
            variants_data = prod_data.pop('variants')
            cat = categorias[prod_data.pop('category')]
            
            producto = Product.objects.create(
                category=cat,
                **prod_data,
                is_active=True
            )
            
            # Crear variantes
            for var_data in variants_data:
                ProductVariant.objects.create(
                    product=producto,
                    **var_data
                )
            
            self.stdout.write(self.style.SUCCESS(f'  ✓ {producto.name} ({len(variants_data)} variantes)'))

        # ============ ZONAS DE ENTREGA ============
        self.stdout.write('\n🚚 Creando zonas de entrega...')
        
        zonas_data = [
            ('Centro', 2.50, '30-45 min'),
            ('Norte', 3.50, '45-60 min'),
            ('Sur', 3.50, '45-60 min'),
            ('Este', 4.00, '60-75 min'),
            ('Oeste', 4.00, '60-75 min'),
        ]

        for nombre, precio, tiempo in zonas_data:
            zona = DeliveryZone.objects.create(
                name=nombre,
                price=precio,
                estimated_time=tiempo,
                is_active=True
            )
            self.stdout.write(self.style.SUCCESS(f'  ✓ {nombre} - ${precio} ({tiempo})'))

        # ============ PROMOCIONES ============
        self.stdout.write('\n🎁 Creando promociones...')
        
        now = timezone.now()
        promociones_data = [
            {
                'name': 'Descuento Primera Compra',
                'code': 'BIENVENIDA10',
                'description': '10% de descuento en tu primera compra',
                'discount_type': 'percentage',
                'discount_value': 10.00,
                'min_purchase': 15.00,
                'valid_from': now,
                'valid_until': now + timedelta(days=90),
            },
            {
                'name': 'Envío Gratis',
                'code': 'ENVIOGRATIS',
                'description': 'Envío gratis en compras mayores a $30',
                'discount_type': 'fixed',
                'discount_value': 4.00,
                'min_purchase': 30.00,
                'valid_from': now,
                'valid_until': now + timedelta(days=60),
            },
            {
                'name': 'Black Friday',
                'code': 'BLACKFRIDAY25',
                'description': '25% de descuento especial Black Friday',
                'discount_type': 'percentage',
                'discount_value': 25.00,
                'min_purchase': 20.00,
                'valid_from': now - timedelta(days=5),
                'valid_until': now + timedelta(days=2),
            },
        ]

        for promo_data in promociones_data:
            promo = Promotion.objects.create(**promo_data, is_active=True)
            self.stdout.write(self.style.SUCCESS(f'  ✓ {promo.code} - {promo.discount_value}{"%" if promo.discount_type == "percentage" else "$"}'))

        # ============ RESUMEN ============
        self.stdout.write(self.style.SUCCESS('\n' + '='*50))
        self.stdout.write(self.style.SUCCESS('✅ Datos de prueba creados exitosamente!\n'))
        
        self.stdout.write(self.style.WARNING('📊 RESUMEN:'))
        self.stdout.write(f'  • Usuarios: {User.objects.count()}')
        self.stdout.write(f'  • Categorías: {Category.objects.count()}')
        self.stdout.write(f'  • Productos: {Product.objects.count()}')
        self.stdout.write(f'  • Variantes: {ProductVariant.objects.count()}')
        self.stdout.write(f'  • Zonas de entrega: {DeliveryZone.objects.count()}')
        self.stdout.write(f'  • Promociones: {Promotion.objects.count()}')
        
        self.stdout.write(self.style.WARNING('\n🔑 CREDENCIALES:'))
        self.stdout.write('  Admin:')
        self.stdout.write('    Email: admin@momentosdulces.com')
        self.stdout.write('    Password: admin123')
        self.stdout.write('\n  Recepcionista:')
        self.stdout.write('    Email: recepcion@momentosdulces.com')
        self.stdout.write('    Password: recep123')
        self.stdout.write('\n  Usuarios:')
        self.stdout.write('    Email: juan@example.com, ana@example.com, carlos@example.com')
        self.stdout.write('    Password: user123')
        
        self.stdout.write(self.style.SUCCESS('\n¡Listo para probar! 🎉'))
