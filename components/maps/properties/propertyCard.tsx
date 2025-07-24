import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { PropertyDetails } from '@/types/_dashboard/maps';
import Link from 'next/link';

const PropertyCard: React.FC<{ property: PropertyDetails }> = ({
  property
}) => {
  const altPhotos = property.alt_photos.split(', ');

  return (
    <Card className="mx-auto max-w-lg hover:border-orange-800 dark:hover:border-amber-200">
      <CardContent className="p-4">
        <div className="relative mb-4">
          <Carousel className="w-full">
            <CarouselContent className="w-full">
              {[property.primary_photo, ...altPhotos].map((photo, index) => (
                <CarouselItem key={index} className="w-full">
                  <Image
                    src={photo}
                    alt={`Property Image ${index + 1}`}
                    width={600}
                    height={400}
                    className="h-64 w-full rounded-md object-cover"
                    style={{ height: '300px' }} // Ensure all images have the same height
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="absolute inset-x-0 bottom-2 flex justify-center space-x-4">
              <CarouselPrevious
                type="button"
                className="rounded-full bg-gray-900 p-2 text-white"
              />
              <CarouselNext
                type="button"
                className="rounded-full bg-gray-900 p-2 text-white"
              />
            </div>
          </Carousel>
        </div>
        <div className="text-center">
          <h4 className="font-semibold">
            <Link href={`dashboard/properties/${property.id}`}>
              {property.street}, {property.city}, {property.state}{' '}
              {property.zip_code}
            </Link>
          </h4>
          <p>Est. Value: ${property.list_price.toLocaleString()}</p>
          <p>Last Sale: {property.last_sold_date}</p>
          <p>Sold Price: ${property.sold_price.toLocaleString()}</p>
          <p>
            {property.beds} bed | {property.full_baths} full bath |{' '}
            {property.sqft} sqft
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
