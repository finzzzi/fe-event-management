"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { userService } from "@/services/userService";
import { OrganizerProfile } from "@/types/event";

export default function EventOrganizerProfile() {
  const params = useParams();
  const organizerId = params.id as string;

  const [organizerData, setOrganizerData] = useState<OrganizerProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizerProfile = async () => {
      try {
        setLoading(true);
        const data = await userService.fetchOrganizerProfile(organizerId);
        setOrganizerData(data);
      } catch (err) {
        console.error("Failed to fetch organizer profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (organizerId) {
      fetchOrganizerProfile();
    }
  }, [organizerId]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-2xl ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile Header Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded-md w-64 mx-auto mb-4 animate-pulse"></div>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 bg-gray-200 rounded animate-pulse"
                  ></div>
                ))}
                <div className="w-12 h-6 bg-gray-200 rounded ml-2 animate-pulse"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-40 mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Reviews Section Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="h-7 bg-gray-200 rounded-md w-48 mb-6 animate-pulse"></div>

            <div className="space-y-6">
              {Array.from({ length: 2 }, (_, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }, (_, starIndex) => (
                          <div
                            key={starIndex}
                            className="w-5 h-5 bg-gray-200 rounded animate-pulse"
                          ></div>
                        ))}
                        <div className="w-8 h-4 bg-gray-200 rounded ml-2 animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!organizerData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Event Organizer Not Found
          </h2>
          <p className="text-gray-600">
            The organizer profile with this ID is not available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-blue-600">🏢</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {organizerData.name}
            </h1>

            {/* Overall Rating */}
            <div className="flex items-center justify-center gap-2 mb-2">
              {renderStars(organizerData.overallRating)}
              <span className="text-xl font-semibold text-gray-700 ml-2">
                {organizerData.overallRating.toFixed(1)}
              </span>
            </div>
            <p className="text-gray-600">
              Overall Rating ({organizerData.reviews.length} reviews)
            </p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Reviews & Testimonials
          </h2>

          {organizerData.reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">💬</div>
              <p className="text-gray-600">
                No reviews yet for this event organizer.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {organizerData.reviews.map((review, index) => (
                <div
                  key={index}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-semibold">
                        {review.reviewedBy.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {review.reviewedBy}
                        </h3>
                        <span className="text-gray-500">•</span>
                        <span className="text-sm text-gray-600">
                          {review.eventName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        {renderStars(review.rating)}
                        <span className="text-sm font-medium text-gray-700">
                          {review.rating}/5
                        </span>
                      </div>

                      <p className="text-gray-700 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
