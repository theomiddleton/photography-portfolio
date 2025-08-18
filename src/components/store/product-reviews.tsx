'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Textarea } from '~/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Star, ThumbsUp, MessageCircle, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '~/lib/utils'
import { toast } from 'sonner'

interface Review {
  id: string
  customerName: string
  rating: number
  title: string
  content: string
  createdAt: Date
  verified: boolean
  helpful: number
  images?: string[]
}

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
  canReview?: boolean
  className?: string
}

export function ProductReviews({
  productId,
  reviews,
  averageRating,
  totalReviews,
  canReview = true,
  className
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    customerName: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { rating, count, percentage }
  })

  const handleSubmitReview = async () => {
    if (!newReview.title.trim() || !newReview.content.trim() || !newReview.customerName.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      // TODO: Implement real review submission API
      console.warn('ProductReviews: TODO - Replace with real review submission API')
      toast.error('Review submission not yet implemented - TODO: Connect to real API')
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      // TODO: Implement real helpful marking API
      console.warn('ProductReviews: TODO - Replace with real helpful marking API')
      toast.error('Mark as helpful not yet implemented - TODO: Connect to real API')
    } catch (error) {
      toast.error('Failed to mark as helpful')
    }
  }

  const StarRating = ({ rating, interactive = false, onRatingChange }: {
    rating: number
    interactive?: boolean
    onRatingChange?: (rating: number) => void
  }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRatingChange?.(star)}
          className={cn(
            "transition-colors",
            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
          )}
          disabled={!interactive}
        >
          <Star
            className={cn(
              "h-4 w-4",
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Reviews Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customer Reviews</span>
            {canReview && (
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button size="sm">Write a Review</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Write a Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Rating</Label>
                      <StarRating
                        rating={newReview.rating}
                        interactive
                        onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reviewer-name">Your Name</Label>
                      <Input
                        id="reviewer-name"
                        value={newReview.customerName}
                        onChange={(e) => setNewReview(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="review-title">Review Title</Label>
                      <Input
                        id="review-title"
                        value={newReview.title}
                        onChange={(e) => setNewReview(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Summarize your review"
                      />
                    </div>
                    <div>
                      <Label htmlFor="review-content">Your Review</Label>
                      <Textarea
                        id="review-content"
                        value={newReview.content}
                        onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Share your experience with this product"
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitReview} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </Button>
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rating Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
                <div>
                  <StarRating rating={Math.round(averageRating)} />
                  <p className="text-sm text-gray-600 mt-1">
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-6">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={review.rating} />
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium">{review.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{review.customerName}</span>
                      <span>•</span>
                      <span>{
                        formatDistanceToNow(
                          typeof review.createdAt === 'string' ? new Date(review.createdAt) : review.createdAt,
                          { addSuffix: true }
                        )
                      }</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Review Content */}
                <p className="text-gray-700 leading-relaxed">{review.content}</p>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((image, index) => (
                      <div key={index} className="w-16 h-16 bg-gray-100 rounded border">
                        <img
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Review Actions */}
                <div className="flex items-center gap-4 text-sm">
                  <button
                    onClick={() => handleMarkHelpful(review.id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    Helpful ({review.helpful})
                  </button>
                  <button className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors">
                    <MessageCircle className="h-3 w-3" />
                    Reply
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">Be the first to share your experience with this product.</p>
            {canReview && (
              <Button onClick={() => setShowReviewForm(true)}>
                Write the First Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}